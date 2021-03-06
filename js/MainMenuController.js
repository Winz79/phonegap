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

MainMenuController = function() {
    var sender = this;
    var sudokuBoardController;
    var optionsController;
    var voiceOverManager;

    var setContinueState = function() {
        var localStorage = new LocalStorageRepository();
        if(localStorage.GetValueForKey("gameSave")) {
            $(".continueButton").show();
        } else {
            $(".continueButton").hide();
        }
    };
    
    var initMenuScreen = function() {
        var localStorage = new LocalStorageRepository();

        voiceOverManager.OutputMessage("Main menu");

        setContinueState();

        var menuItemAnimation;

        //Mouse input
        $(".mainMenu .menuItem:visible").first().addClass("selected");
        $(".mainMenu .menuItem").mouseenter(function() {
            $(".mainMenu .menuItem").removeClass("selected");
            $(this).addClass("selected animated pulse");
            menuItemAnimation = cleanUpAnimationAfterTimeout($(this), 400);

            voiceOverManager.OutputMessage($(this).text());
        });
        $(".mainMenu .menuItem").click(function() {
            triggerSelectedAction();
        });

        //Keyboard input
        $(window).keydown(function(evt) {
            if($("#menuScreen").is(":visible")) {
                var currentlySelected = $(".mainMenu .menuItem.selected");
                var handled = true;
                switch(keyCodeToAction(evt.which)) {
                    case "up":
                        var newSelection = currentlySelected.parent("li").prev(":visible").find(".menuItem");
                        if(newSelection.length) {
                            newSelection.addClass("selected animated pulse");
                            menuItemAnimation = cleanUpAnimationAfterTimeout(newSelection, 400);
                            currentlySelected.removeClass("selected");

                            voiceOverManager.OutputMessage(newSelection.text());
                        }
                        break;
                    case "down":
                        var newSelection = currentlySelected.parent("li").next(":visible").find(".menuItem");
                        if(newSelection.length) {
                            newSelection.addClass("selected animated pulse");
                            menuItemAnimation = cleanUpAnimationAfterTimeout(newSelection, 400);
                            currentlySelected.removeClass("selected");

                            voiceOverManager.OutputMessage(newSelection.text());
                        }
                        break
                    case "enter":
                        triggerSelectedAction();
                        break;
                    default:
                        handled = false;
                        break;
                }
                if(handled) {
                    evt.preventDefault();
                }
            }
        });

        var triggerSelectedAction = function() {
            var currentlySelected = $(".mainMenu .menuItem.selected");
            clearTimeout(menuItemAnimation);
            removeAnimations(currentlySelected);
            currentlySelected.addClass("animated bounceOutRight");

            setTimeout(function() {
                $("#menuScreen").addClass("animated bounceOutRight");
                setTimeout(function() {
                    $(".screen").hide();
                    switch(currentlySelected.attr("data-action")) {
                        case "continue":
                            sudokuBoardController.StartGame({
                                existingGame: localStorage.GetValueForKey("gameSave")
                            });
                            $("#gameScreen").addClass("animated bounceInLeft").show();
                            break;

                        case "newGame":
                            sudokuBoardController.StartGame({
                                existingGame: null,
                                difficulty: $("html").attr("data-difficulty")
                            });
                            $("#gameScreen").addClass("animated bounceInLeft").show();
                            break;

                        case "options":
                            //Select first item
                            $(".optionsMenu .menuItem").removeClass("selected");
                            $(".optionsMenu .menuItem").siblings(".leftArrow, .rightArrow").css("display", "none");
                            $(".optionsMenu .menuItem").first().addClass("selected");
                            $(".optionsMenu .menuItem").first().siblings(".leftArrow, .rightArrow").css("display", "inline-block");

                            //Show all arrows on mobile
                            $(".mobile .optionsMenu .menuItem").siblings(".leftArrow, .rightArrow").css("display", "inline-block");

                            $("#optionsScreen").addClass("animated bounceInLeft").show();

                            voiceOverManager.OutputMessage("Options screen");
                            break;

                        case "help":
                            $("#helpScreen").addClass("animated bounceInLeft").show();

                            var message = "Help screen. ";
                            $("#helpScreen .desktop-only.content").each(function() {
                                if($(this).text() != "") {
                                    message += $(this).text();
                                }
                            });
                            voiceOverManager.OutputMessage(message);
                            break;
                    }
                }, 400);
            }, 100);
        };
    };

    var initMainMenuButton = function() {

        document.addEventListener('menubutton', function(e) {
            $("#optionsScreen").addClass("animated bounceInLeft").show();
        },false);

        document.addEventListener('backbutton', function(e) {
            if(!$("#menuScreen").is(":visible")) {
                navigateToMenu();
            }
            else {
                if (navigator.app && navigator.app.exitApp) {
                    navigator.app.exitApp();
                } else if (navigator.device && navigator.device.exitApp) {
                    navigator.device.exitApp();
                }
            }
        },false);
        //Mouse input
        $(".screen div .back").click(function() {
            navigateToMenu();
        });
        $(".screen div .back").mouseenter(function() {
            voiceOverManager.OutputMessage("Back to main menu");
        });

        //Keyboard input
        $(window).keydown(function(evt) {
            if(keyCodeToAction(evt.which) == "escape") {
                if(!$("#menuScreen:visible").length) {
                    navigateToMenu();
                    evt.preventDefault();
                }
            }
        });

        var navigateToMenu = function() {
            //Reset main menu
            $(".mainMenu .menuItem").removeClass("selected");
            removeAnimations($("#menuScreen .menuItem"));

            $("#menuScreen .menuItem").show();

            setContinueState();

            voiceOverManager.OutputMessage("Main menu");

            //Show menu
            $(".screen:visible .back").first().addClass("animated bounceOutLeft");

            setTimeout(function() {
            $(".screen:visible").first().addClass("animated bounceOutLeft");
                setTimeout(function() {
                    removeAnimations($(".screen"));
                    removeAnimations($(".screen .back"));
                    $(".screen").hide();
                    $("#menuScreen").show().addClass("animated bounceInRight");
                    $(".mainMenu .menuItem:visible").first().addClass("selected"); //Select first item
                }, 400);
            }, 100);
        };
    };

    var init = new function() {
        voiceOverManager = new VoiceOverManager("messageOutput");
        optionsController = new OptionsController(voiceOverManager);
        sudokuBoardController = new SudokuBoardController(voiceOverManager);
        initMenuScreen();
        initMainMenuButton();
    };
};