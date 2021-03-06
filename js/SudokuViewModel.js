// The MIT License (MIT)

// Copyright (c) 2013 Eddie Lee, Richard Gibbons & Arron Jeffery

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var SudokuViewModel = function() {
	var sender = this;
	this.NeedsSave = ko.observable(false);
	this.Difficulty = ko.observable("");

    this.UseBoardInputPad = ko.observable(false);

	this.IsComplete = ko.observable(false);

	this.InitialHints = 3;
	this.AvailableHints = ko.observable(this.InitialHints);

	this.Squares = ko.observableArray();

    this.DisplaySelectedRowsColumns = ko.observable(true);
    this.DisplaySelectedNumbers = ko.observable(true);

    this.CurrentNumber = ko.observable('0');

    this.IsCurrentNumber  = ko.computed(function(n) {
        var cur = this.CurrentNumber();
        var res = (cur == n);
        return res;
    },this);


	this.GameTitle = ko.computed(function() {
		return capitaliseFirstLetter(this.Difficulty()) + " Game";
	}, this);

	this.HintLabel = ko.computed(function() {
		return "Hints - " + this.AvailableHints() + "/" + this.InitialHints;
	}, this);

	this.SetSelectedCell = function(square, cell, displayInputPad) {
		if(sender.IsComplete()) return; //Don't run when game is complete
        var selectedValue = sender.Squares()[square].Cells()[cell].CurrentValue();

		for (var squareIndex = 0; squareIndex < sender.Squares().length; squareIndex++) {
			for (var cellIndex = 0; cellIndex < sender.Squares()[squareIndex].Cells().length; cellIndex++) {
                // Selected cell
				if(squareIndex == square && cellIndex == cell) {
					sender.Squares()[squareIndex].Cells()[cellIndex].IsSelected(true);
                    sender.CurrentNumber(sender.Squares()[squareIndex].Cells()[cellIndex].CurrentValue());

                    if(sender.DisplaySelectedRowsColumns()) {
                        sender.Squares()[squareIndex].Cells()[cellIndex].IsNumberSelected(true);
                    }

                    if(sender.DisplaySelectedRowsColumns()) {
                        sender.Squares()[squareIndex].Cells()[cellIndex].IsColumnSelected(false);
                        sender.Squares()[squareIndex].Cells()[cellIndex].IsRowSelected(false);
                    }
					if(displayInputPad) {
						sender.Squares()[squareIndex].Cells()[cellIndex].WasSelectedWithMouse(true);
					}
				}
                // Other cells
                else {
                    sender.Squares()[squareIndex].Cells()[cellIndex].IsSelected(false);
					sender.Squares()[squareIndex].Cells()[cellIndex].WasSelectedWithMouse(false);



                   if(sender.DisplaySelectedRowsColumns() && sender.Squares()[squareIndex].Cells()[cellIndex].CurrentValue() == selectedValue) {
                        sender.Squares()[squareIndex].Cells()[cellIndex].IsNumberSelected(true);
                    }
                    else {
                        sender.Squares()[squareIndex].Cells()[cellIndex].IsNumberSelected(false);
                    }

                    // same row than the selected cell
                    if(sender.DisplaySelectedRowsColumns()) {
                        if(Math.floor(squareIndex / 3) == Math.floor(square / 3) && Math.floor(cellIndex / 3) == Math.floor(cell / 3)) {
                            sender.Squares()[squareIndex].Cells()[cellIndex].IsRowSelected(true);
                        }
                        else
                            sender.Squares()[squareIndex].Cells()[cellIndex].IsRowSelected(false);

                        if((squareIndex % 3) == (square % 3) && (cellIndex % 3) == (cell % 3)) {
                            sender.Squares()[squareIndex].Cells()[cellIndex].IsColumnSelected(true);
                        }
                        else
                            sender.Squares()[squareIndex].Cells()[cellIndex].IsColumnSelected(false);
                    }

                }


			};
		};
	};

	this.HideInputPad = function() {
		for (var squareIndex = 0; squareIndex < sender.Squares().length; squareIndex++) {
			for (var cellIndex = 0; cellIndex < sender.Squares()[squareIndex].Cells().length; cellIndex++) {
				sender.Squares()[squareIndex].Cells()[cellIndex].WasSelectedWithMouse(false);
			};
		};
	};

	this.GetSelectedCell = function() {
		for (var squareIndex = 0; squareIndex < sender.Squares().length; squareIndex++) {
			for (var cellIndex = 0; cellIndex < sender.Squares()[squareIndex].Cells().length; cellIndex++) {
				if(sender.Squares()[squareIndex].Cells()[cellIndex].IsSelected()) {
					return {
						square: squareIndex,
						cell: cellIndex
					};
				}
			};
		};
	};


	this.SetCellValue = function(square, cell, value) {
		if(sender.IsComplete()) return; //Don't run when game is complete
		if(sender.Squares()[square].Cells()[cell].IsEditable()) {
			sender.Squares()[square].Cells()[cell].CurrentValue(value);
			sender.Squares()[square].Cells()[cell].WasSelectedWithMouse(false);
			sender.Squares()[square].Cells()[cell].IsValid(true);

            sender.CurrentNumber(value);

            sender.RequestSave();
        }
	};

	this.SelectClickedCell = function(data, evt) {
		for (var squareIndex = 0; squareIndex < sender.Squares().length; squareIndex++) {
			for (var cellIndex = 0; cellIndex < sender.Squares()[squareIndex].Cells().length; cellIndex++) {
				if(data.ColIndex() == sender.Squares()[squareIndex].Cells()[cellIndex].ColIndex() && 
					data.RowIndex() == sender.Squares()[squareIndex].Cells()[cellIndex].RowIndex()) {
					evt.stopImmediatePropagation();
                    console.info("SelectClickedCell : " + squareIndex + " ," + cellIndex);
					return sender.SetSelectedCell(squareIndex, cellIndex, sender.UseBoardInputPad());
				}
			};
		};
	};

    this.SetValueFromInputPad = function(value, data, evt) {
		for (var squareIndex = 0; squareIndex < sender.Squares().length; squareIndex++) {
			for (var cellIndex = 0; cellIndex < sender.Squares()[squareIndex].Cells().length; cellIndex++) {
				if(data.ColIndex() == sender.Squares()[squareIndex].Cells()[cellIndex].ColIndex() && 
					data.RowIndex() == sender.Squares()[squareIndex].Cells()[cellIndex].RowIndex()) {
					evt.stopImmediatePropagation();
					sender.SetCellValue(squareIndex, cellIndex, value);
					return;
				}
			};
		};
	};

    this.SetValueFromInputPad2 = function(value,data,evt) {
        var currentSelection = sender.GetSelectedCell();
        if(!currentSelection) return;

        var square = currentSelection.square;
        var cell = currentSelection.cell;

        evt.stopImmediatePropagation();
        sender.SetCellValue(square, cell, value);
        return;

    }

	this.ResetAllValidationFlags = function() {
		for (var squareIndex = 0; squareIndex < sender.Squares().length; squareIndex++) {
			for (var cellIndex = 0; cellIndex < sender.Squares()[squareIndex].Cells().length; cellIndex++) {
				sender.Squares()[squareIndex].Cells()[cellIndex].IsValid(true);
			};
		};
	};

	this.RequestSave = function() {
		sender.NeedsSave(true);
	};
};

var SquareViewModel = function() {
	this.Cells = ko.observableArray();
};

var CellViewModel = function() {
	this.SolutionValue = ko.observable();
	this.OriginalValue = ko.observable();
	this.RowIndex = ko.observable();
	this.ColIndex = ko.observable();
	this.CurrentValue = ko.observable();
	this.IsSelected = ko.observable(false);
	this.IsValid = ko.observable(true);

    this.IsNumberSelected = ko.observable(false);
    this.IsRowSelected = ko.observable(false);
    this.IsColumnSelected = ko.observable(false);

	this.WasSelectedWithMouse = ko.observable(false);

	this.IsEditable = ko.computed(function() {
		return !this.OriginalValue();
	}, this);

	this.DisplayInputPad = ko.computed(function() {
		return this.WasSelectedWithMouse() && this.IsEditable();
	}, this);

	this.IsFilled = ko.computed(function() {
        return this.CurrentValue() != "";
    }, this);

	this.MarkAsInvalid = ko.computed(function() {
        return this.IsFilled() && this.IsEditable() && !this.IsValid();
    }, this);

    this.MarkAsValid = ko.computed(function() {
        return this.IsFilled() && this.IsEditable() && this.IsValid();
    }, this);


};