var app = (function() {
    var list = [];
    var trelloApp = {};
    trelloApp.BoardView = function(params) {
        self = this;
        this.name = params.name || "";
        this.type = params.type || "";
        this.id = params.id;
        this.parent = params.parent || '';
        this.parentIndex = this.parent != '' ? (this.parent).match(/\d+/)[0] : '';
        this.render = function() {
            var tmpl, clone;
            if (this.type == "board") {
                tmpl = document.querySelector("#boardTmpl").content
                tmpl.querySelector(".board-name").innerText = this.name;
                clone = document.importNode(tmpl, true);
            } else {
                tmpl = document.querySelector("#cardTmpl").content;
                tmpl.querySelector(".card-name").innerText = this.name;
                // tmpl.querySelector(".card-desc").innerText = this.desc;
                clone = document.importNode(tmpl, true);
            }
            return clone;
        }
        this.addToList = function() {
            var myArray;
            if (self.type == "board") {
                myArray = list;
                myArray[myArray.length] = {
                    name: self.name,
                    id: 'board_' + (parseInt(list.length) + 1),
                    type: 'board',
                    tasks: []
                }
            } else {
                myArray = list[self.parentIndex - 1].tasks;
                myArray[myArray.length] = {
                    name: self.name,
                    type: 'task',
                    parent: 'board_' + self.parentIndex
                }
            }
        };
    }
    trelloApp.showBoardsDp = function() {
        document.getElementById("boards-dp").classList.toggle("show");

    };

    trelloApp.addItem = function(params) {
        var view = new trelloApp.BoardView(params);
        if (view.type == 'board') {
            var el = document.createElement('div');
            el.className = "board board-1";
            el.setAttribute('id', 'board_' + (parseInt(list.length) + 1));

            el.appendChild(view.render());
            document.getElementById("board-container").appendChild(el);
        } else {
            var el = document.createElement('li');
            el.className = "task";
            el.setAttribute('data-index', (list[view.parentIndex - 1].tasks.length));
            el.setAttribute('data-board-index', view.parentIndex - 1);
            el.setAttribute('draggable', 'true');
            el.setAttribute('ondragstart', 'app.drag(event)');
            el.appendChild(view.render());
            document.getElementById(view.parent).getElementsByClassName('task-items')[0].insertBefore(el, document.getElementById(view.parent).getElementsByClassName('task-items')[0].firstChild);
        }
        view.addToList();
        trelloApp.saveData();
    };
    trelloApp.addDragData = function(dragData, parentIndex) {
        myArray = list[parentIndex - 1].tasks;
        myArray[myArray.length] = {
            name: dragData[0].name,
            type: 'task',
            parent: 'board_' + parentIndex
        }
    };

    trelloApp.allowDrop = function(e) {
        e.preventDefault();
    };
    trelloApp.drag = function(e) {
        item = e.target;
        e.dataTransfer.setData("text", '');
    };
    trelloApp.drop = function(e) {
        e.preventDefault();
        e.target.appendChild(item);
        var newBoardIndex = (e.target.parentNode.id).match(/\d+/)[0];
        var deleteTaskIndex = item.getAttribute('data-index');
        var deleteBoardIndex = item.getAttribute('data-board-index');
        dragData = list[deleteBoardIndex].tasks.slice(deleteTaskIndex, deleteTaskIndex + 1)
        list[deleteBoardIndex].tasks.splice(deleteTaskIndex, 1);
        trelloApp.addDragData(dragData, newBoardIndex);
        trelloApp.saveData();
    };
    trelloApp.loadInitData = function() {
        if (window.localStorage && localStorage.trelloAppData == undefined) {
            localStorage.trelloAppData = JSON.stringify([{
                id: 'board_1',
                name: 'front end task',
                type: 'board',
                tasks: [{
                    name: ' js task',
                    parent: 'board_1',
                    type: 'card'
                }]
            }]);
        }
        var i, j, board, card, trelloAppData = JSON.parse(localStorage.trelloAppData);
        for (i in trelloAppData) {
            board = trelloAppData[i];
            trelloApp.addItem(board);
            for (j in board.tasks) {
                var task = board.tasks[j];
                trelloApp.addItem(task);
            }
        }
    };
    trelloApp.saveData = function() {
        if (window.localStorage) {
            window.localStorage.trelloAppData = JSON.stringify(list);
        }
    };
    trelloApp.editBoardName = function(e) {
        e.target.setAttribute('contenteditable', 'true');

    };
    trelloApp.saveBoardName = function(e) {
        e.target.setAttribute('contenteditable', 'false');
        console.log(e.target.parentNode.getAttribute("id"))
        for (var index = 0; index < list.length; index++) {
            var element = list[index];
            if (element.id == e.target.parentNode.getAttribute("id")) {
                element.name = e.target.innerText;
            }
        }
        trelloApp.saveData()
        console.log(list)



    };
    trelloApp.enableEditCard = function(index) {
        document.getElementById('card_name').value = list[index.boardIndex].tasks[index.taskIndex].name;
        document.getElementById('edit_card').value = "true";
        document.getElementById('edit_card_index').value = index.taskIndex;
        document.getElementById('parent_node').value = 'board_' + (parseInt(index.boardIndex) + 1);
    };
    trelloApp.editCard = function(param) {
        this.name = param.name;
        this.boardIndex = (param.parent).match(/\d+/)[0] - 1;
        var element = document.getElementById(param.parent).getElementsByClassName('task-items')[0].getElementsByClassName('task')[param.taskIndex];
        element.getElementsByTagName('span')[0].innerHTML = list[this.boardIndex].tasks[param.taskIndex].name = this.name;
        trelloApp.saveData();
    };
    trelloApp.deleteCard = function(event) {
        var element = event.target.parentNode.parentNode;
        var cardId = element.getAttribute('data-index');
        var boardId = element.getAttribute('data-board-index');
        element.remove();
        list[boardId].tasks.splice(cardId, 1);
        trelloApp.saveData();
    };
    trelloApp.newTaskForm = function(e, index) {
        //e.target.style.display = "none";
        e.target.parentNode.appendChild(document.querySelector(".card-new"))
        document.querySelector(".card-new").classList.toggle("hide");
        document.getElementById("parent_node").value = e.target.parentNode.id;
        if (index != undefined) {
            trelloApp.enableEditCard(index);
        }
    };
    trelloApp.hideCard = function(node) {
        document.querySelector(".card-new").classList.toggle("hide");
        var oInput = document.querySelector("#" + node);
        oInput.querySelector(".add-card").style.display = "block";
    };

    return trelloApp;
})();


window.onload = function() {
    app.loadInitData();
    // var elems = document.getElementsByClassName("task-actions");
    // size = elems.length;
    // for (var i = 0; i < size; i++) {
    //     elems[i].className = "task-actions hide";
    // }
    // var tasks = document.getElementsByTagName("li")
    // for (var index = 0; index < tasks.length; index++) {
    //     tasks[index].addEventListener("mouseover", function(e) {
    //         e.target.firstElementChild.className = "task-actions";
    //     });
    //     tasks[index].addEventListener("mouseleave", function(e) {
    //         e.target.firstElementChild.className = "task-actions hide";
    //     })
    // }

    document.querySelector(".create-btn").addEventListener("click", app.showBoardsDp)
    document.querySelector("#add-board").addEventListener("submit", function(e) {
        e.preventDefault();
        if (!document.getElementById('board-name').value) {
            document.getElementById('board-name').focus();
            console.log("sdhsdhsd")
            return false;
        } else {
            var newBoard = {
                name: document.getElementById('board-name').value,
                type: "board"
            }
            document.getElementById('board-name').value = "";
            app.addItem(newBoard);
            document.getElementById("boards-dp").classList.toggle("show");

        }
    });
    var editableTarget;
    document.addEventListener('click', function(e) {
        var target = e.target;

        console.log(e.target)
        if (target.classList.contains("add-card")) {
            app.newTaskForm(e);
        }
        if (target.classList.contains("delete-card")) {
            app.deleteCard(e);
        }
        if (target.classList.contains("edit-card")) {
            var index = {
                taskIndex: target.parentNode.parentNode.getAttribute('data-index'),
                boardIndex: target.parentNode.parentNode.getAttribute('data-board-index')
            }
            app.newTaskForm(e, index);
        }
    });
    if (document.getElementsByClassName("board-name")) {
        var editBoardName = document.getElementsByClassName("board-name")
        for (var i = 0; i < editBoardName.length; i++) {
            editBoardName[i].addEventListener("click", function(e) {
                app.editBoardName(e)
            });
            editBoardName[i].addEventListener("keydown", function(e) {
                if (e.keyCode == 13) {
                    app.saveBoardName(e)
                }
            })
        }

    };
    document.getElementById("list-card").addEventListener("submit", function(e) {
        e.preventDefault();
        if (!document.getElementById('card_name').value) {
            document.getElementById('card_name').focus()
            console.log("please enter name")
            return false;
        } else {
            var data = {
                name: document.getElementById('card_name').value,
                parent: document.getElementById('parent_node').value,
                taskIndex: document.getElementById('edit_card_index').value,
                type: "task"
            }
            if (document.getElementById('edit_card').value == "true") {
                app.editCard(data);
            } else {
                app.addItem(data);
            }

            app.hideCard(data.parent);
            document.getElementById('card_name').value = "";
        }


    })


}