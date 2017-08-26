/**
 * Draw.io Plugin to create C4 Architecture Diagramms
 */
Draw.loadPlugin(function(ui) {
    c4Utils = {
        isC4: function(cell){
            return (cell &&
                cell.hasOwnProperty('c4') &&
                (cell.c4 != null));
        },
        isC4Model: function (cell) {
            return (c4Utils.isC4(cell) &&
                cell &&
                cell.hasOwnProperty('value') &&
                (cell.value &&
                cell.value.hasAttribute('c4Type'))
                );
        },
        isC4Person: function (cell) {
            return (c4Utils.isC4(cell) &&
                (cell.hasOwnProperty('value') &&
                cell.value.length === 0 ) &&
                cell.getChildCount() === 2 &&
                cell.getChildAt(0).value.getAttribute('c4Type') == 'body');
        }
    };

    function createSettingsIcon(){
        var img = mxUtils.createImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAACpklEQVRIS7VVMU9TURg9nWiZoF0k1MQmlKCREhhowUHaScpWdYHoINUORoKTiT+AhMnE6IDigraL2g10amGhxaFGMJHQJiWxBJcWJl6Zas4H9/leH4VKwl2a13vv+c73nfN911ar1Wq4oGVrBpzxq9VDnYLd3gKbzXYmpabAs2s5bBWKCAwOIPstJ7/dXs/5wNMrGfh6e+BytgvA4pcU3J0d6PNdRWp5FZpWxdhoSPbKlT2sb2wieHPIEszC/H08iQNNQ6m0i1DwBhwOu4BPP3kgwUo7u+CZ4MiwBMlkc3C52tDqcODeRMQUwAROVvlCEbHohFz8mFyUw2SpsuA3A/AsAblHAnPzcXi7PAiNDOsBTOBMce5tAk+nJuWCceUL2/qnt+uKaY9EXrx8h9jDcRMJS1nIqFLZx51IWAB+rP+SsjB11p2sy+V9YUwNuD4ll+B0tplY838LuHLG/YnbOnA9I5WhCrAQ/4zuLg8C/gFrzenjjZ+bKO38QWYtp4s3M/vakqq6rQI8f/ZYHPNmPoE+3zW4Oy+h93qP9IEwV+Ixutfrkbpt5YtIr6yKuI0W60z29DwD5PNF6Ye7kTHRTAf/Xdo1NQbB6Rzl55MCUAs6xNhQvHfZ3WEGpyhkTSecm3lhW9jTDDpz1pxdRifQHUrA/6k5LUz30FHsbr3mxpTr3bL0NYVHUbN/lYDhW0d2PNUtRvDGPm+XWlKbcnnP5POmwE/rUAqlVv1EpNtmZl9hemqycYcezZZtxKLjMlsoMld4NGiZLenljIj2b7YkxAwNZwuBmKKmHUrqAX8/WtVUPGZF0Rc+JBEaGcKBVkV27TtcrnY4HC1gVxvXiY8FM6BQzcxzBmPJjIxVgKZfIpaLs4Nu8g/2n/8lqu/GC31DGw6XMzb+An4I4cvYKbPGAAAAAElFTkSuQmCC');
        img.setAttribute('title', 'Settings');
        img.style.cursor = 'pointer';
        img.style.width = '16px';
        img.style.height = '16px';
        return img;
    }

    c4StateHandler = function(state){
        mxVertexHandler.apply(this, arguments);
    }
    c4StateHandler.prototype = new mxVertexHandler();
    c4StateHandler.prototype.constructor = c4StateHandler;
    c4StateHandler.prototype.domNode = null;
    c4StateHandler.prototype.init = function(){
        mxVertexHandler.prototype.init.apply(this, arguments);
        this.domNode = document.createElement('div');
        this.domNode.style.position = 'absolute';
        this.domNode.style.whiteSpace = 'nowrap';
        if (this.custom) this.custom.apply(this, arguments);
        var img = createSettingsIcon();
        mxEvent.addGestureListeners(img,
            mxUtils.bind(this, function(evt){ mxEvent.consume(evt);})
        );
        mxEvent.addListener(img, 'click',
            mxUtils.bind(this, function(evt){
                if(c4Utils.isC4Person(this.state.cell)) {
                    var cell = this.state.cell.getChildAt(0);
                    if (cell != null)
                    {
                        var dlg = new EditDataDialog(ui, cell);
                        ui.showDialog(dlg.container, 320, 320, true, false);
                        dlg.init();
                    }
                } else {
                    ui.actions.get('editData').funct();
                }
                mxEvent.consume(evt);
            })
        );
        this.domNode.appendChild(img);
        this.graph.container.appendChild(this.domNode);
        this.redrawTools();
    };
    c4StateHandler.prototype.redraw = function()
    {
        mxVertexHandler.prototype.redraw.apply(this);
        this.redrawTools();
    };
    c4StateHandler.prototype.redrawTools = function()
    {
        if (this.state != null && this.domNode != null)
        {
            var dy = (mxClient.IS_VML && document.compatMode == 'CSS1Compat') ? 20 : 4;
            this.domNode.style.left = (this.state.x + this.state.width - this.domNode.children.length * 14) + 'px';
            this.domNode.style.top = (this.state.y + this.state.height + dy) + 'px';
        }
    };
    c4StateHandler.prototype.destroy = function(sender, me)
    {
        mxVertexHandler.prototype.destroy.apply(this, arguments);
        if (this.domNode != null)
        {
            this.domNode.parentNode.removeChild(this.domNode);
            this.domNode = null;
        }
    };
    origGraphCreateHander = ui.editor.graph.createHandler;
    ui.editor.graph.createHandler = function(state)
    {
        if (state != null && (this.getSelectionCells().length == 1) && c4Utils.isC4(state.cell) && state.cell.c4.handler)
        {
            return new state.cell.c4.handler(state);
        }
        return origGraphCreateHander.apply(this, arguments);
    };


    function registCodec(func){
        var codec = new mxObjectCodec(new func());
        codec.encode = function(enc, obj){
            try{
                var data = enc.document.createElement(func.name);
            }catch(e){

            }
            return data
        };
        codec.decode = function(dec, node, into){
            return new func();
        };
        mxCodecRegistry.register(codec);
    }

    function createC4Person(c4){
        var group = new mxCell('', new mxGeometry(0, 0, 160, 180), 'group;rounded=0;labelBackgroundColor=none;fillColor=none;fontColor=#000000;align=center;html=1;');
        group.setVertex(true);
        group.setConnectable(false);
        group.setAttribute('c4Type', 'person');
        group.c4 = c4;
        var body = new mxCell('', new mxGeometry(0,70,160,110), 'rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#dae8fc;fontColor=#000000;align=center;arcSize=33;strokeColor=#6c8ebf;');
        body.setParent(group);
        body.setVertex(true);
        body.setValue(mxUtils.createXmlDocument().createElement('object'));
        body.setAttribute('label', 'name<div>[Person]</div><div><br></div><div>Beschreibung</div>');
        body.setAttribute('placeholders', '1');
        body.setAttribute('c4Name', 'name');
        body.setAttribute('c4Type', 'body');
        body.setAttribute('c4Description', 'Beschreibung');
        body.c4 = c4;
        var head = new mxCell('', new mxGeometry(40,0,80,80), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;rounded=0;labelBackgroundColor=none;fillColor=#dae8fc;fontSize=12;fontColor=#000000;align=center;strokeColor=#6c8ebf;');
        head.setParent(group);
        head.setVertex(true);
        head.setAttribute('c4Type', 'head');
        head.c4 = c4;
        group.insert(head); // child: 0
        group.insert(body); // child: 1
        return group;
    }

    C4Person = function(){};
    C4Person.prototype.create = function(){
        return createC4Person(this);
    };
    C4Person.prototype.handler = c4StateHandler;
    registCodec(C4Person);

    // Load custom Shape Library...
    // https://raw.githubusercontent.com/tobiashochguertel/draw-io/master/C4-drawIO.xml
    // Adds custom sidebar entry
    ui.sidebar.addPalette('c4', 'C4 Notation', true, function(content) {
        var verticies = [C4Person];
        for (var i in verticies){
            var cell = verticies[i].prototype.create();
            content.appendChild(ui.sidebar.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, cell.label));
        }
    });





    // START -> CUSTOM EDITOR MENU!
    origEditDataDialog = EditDataDialog;
    EditDataDialog = function(ui, cell) {
        if (!c4Utils.isC4(cell)){
            return origEditDataDialog.apply(this, arguments);
        }

        var div = document.createElement('div');
        var graph = ui.editor ? ui.editor.graph : ui.graph;

        div.style.height = '100%'; //'310px';
        div.style.overflow = 'auto';

        var value = graph.getModel().getValue(cell);

        console.log('var graph', graph);
        console.log('graph.getModel()', graph.getModel());
        console.log('var value', value);
        console.log('cell', cell);

        // Converts the value to an XML node
        if (!mxUtils.isNode(value))
        {
            var obj = mxUtils.createXmlDocument().createElement('object');
            obj.setAttribute('label', value || '');
            value = obj;
        }

        // Creates the dialog contents
        var form = new mxForm('properties');
        form.table.style.width = '100%';
        form.table.style.paddingRight = '20px';
        var colgroupName = document.createElement('colgroup');
        colgroupName.width = '120';
        form.table.insertBefore(colgroupName, form.body);
        var colgroupValue = document.createElement('colgroup');
        form.table.insertBefore(colgroupValue, form.body);

        var attrs = value.attributes;
        var names = [];
        var texts = [];
        var count = 0;

        console.log('value.attributes', value.attributes);

        var addTextArea = function(index, name, value)
        {
            names[index] = name;
            texts[index] = form.addTextarea(names[count] + ':', value, 2);
            texts[index].style.width = '100%';
            return texts[index];
        };

        var addText = function(index, name, value)
        {
            names[index] = name;
            texts[index] = form.addText(names[count] + ':', value);
            texts[index].style.width = '100%';
            return texts[index];
        };

        var addAttribute = function(index, name, value)
        {
            names[index] = name;
            texts[index] = document.createElement('textarea');
            texts[index].value = value;
            // texts[index] = form.addText(names[count] + ':', value);
            // texts[index].style.width = '100%';
            return texts[index];
        };

        for (var i = 0; i < attrs.length; i++)
        {
            var nodeName = attrs[i].nodeName;
            var nodeValue = attrs[i].nodeValue;
            // if (cell.awssf.hiddenAttributes && cell.awssf.hiddenAttributes.indexOf(nodeName) >= 0) continue;
            if (nodeName == 'c4Type') {
                var span = document.createElement('span');
                mxUtils.write(span, nodeValue);
                form.addField('c4Type:', span);
            } else if (nodeName == 'label') {
                addAttribute(count, nodeName, nodeValue);
                count++;
                console.log('nodeName is Label: ', names, texts);
                var labelDiv = document.createElement('div');
                labelDiv.setAttribute('style','border: 1px dashed #c2c2c2; margin-bottom: 4px;');
                // mxUtils.write(div, nodeValue);
                labelDiv.innerHTML = nodeValue;
                div.appendChild(labelDiv);
            }
            // else if ((typeof(C4) === "object") && (nodeName == 'resource')){
            //     var input = addText(count, nodeName, nodeValue);
            //     count++;
            //     input.setAttribute("list", "resources");
            //     var datalist = document.createElement('datalist');
            //     datalist.id = "resources";
            //     getResourceList(function(resources){
            //         for (var j in resources){
            //             var opt = document.createElement('option');
            //             opt.value = resources[j];
            //             datalist.appendChild(opt);
            //         };
            //     });
            //     div.appendChild(datalist);
            // }
            // else if (nodeName == 'label' && (awssfUtils.isChoice(cell) || awssfUtils.isRetry(cell) || awssfUtils.isCatch(cell))){
            //     var input = addText(count, nodeName, nodeValue);
            //     count++;
            //     input.setAttribute("list", "candidates");
            //     var datalist = document.createElement('datalist');
            //     datalist.id = "candidates";
            //     var candidates = [];
            //     if (attrs["error_equals"]) candidates.push("%error_equals%");
            //     if (attrs["condition"]) candidates.push("%condition%");
            //     for (var j in candidates){
            //         var opt = document.createElement('option');
            //         opt.value = candidates[j];
            //         datalist.appendChild(opt);
            //     };
            //     div.appendChild(datalist);
            // }
            else if (nodeName == 'error_equals'){
                var input = addText(count, nodeName, nodeValue);
                count++;
                input.setAttribute("list", "errors");
                var datalist = document.createElement('datalist');
                datalist.id = "errors";
                var errors = [
                    "States.ALL", "States.Timeout", "States.TaskFailed", "States.Permissions",
                    "States.ResultPathMatchFailure", "States.BranchFailed", "States.NoChoiceMatched"
                ];
                for (var j in errors){
                    var opt = document.createElement('option');
                    opt.value = errors[j];
                    datalist.appendChild(opt);
                };
                div.appendChild(datalist);
            }
            // else if (cell.awssf && cell.awssf.buildForm){
            //     var res = cell.awssf.buildForm(form, nodeName, nodeValue);
            //     if (res != null){
            //         names[count] = res[0];
            //         texts[count] = res[1];
            //         count++;
            //     }
            // }
            else if (/*nodeName != 'label' && */nodeName != 'placeholders')
            {
                addTextArea(count, nodeName, nodeValue);
                count++;
            }
        }

        console.log(names, texts);

        div.appendChild(form.table);

        this.init = function()
        {
            if (texts.length > 0)
            {
                texts[0].focus();
            }
            else
            {
                nameInput.focus();
            }
        };

        var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
        {
            ui.hideDialog.apply(ui, arguments);
        });
        cancelBtn.className = 'geBtn';

        var applyBtn = mxUtils.button(mxResources.get('apply'), function()
        {
            try
            {
                ui.hideDialog.apply(ui, arguments);

                // Clones and updates the value
                value = value.cloneNode(true);
                var removeLabel = false;

                console.log("FOR: Saving State of an C4Person Notation...");
                console.log(names, texts);
                var c4NotationUpdate = function () {
                    var c4Name = '';
                    var c4Description = '';
                    var labelIndex = -1;
                    for(var i = 0; i < names.length; i++) {
                        if(names[i] === 'c4Name'){
                            c4Name = texts[i].value;
                        }
                        if(names[i] === 'c4Description'){
                            c4Description = texts[i].value;
                        }
                        if(names[i] === 'label'){
                            labelIndex = i;
                        }
                    }
                    if(labelIndex >= 0){
                        texts[labelIndex].value = c4Name + '<div>[Person]</div><div><br></div><div>' + c4Description;
                    }
                };
                c4NotationUpdate();

                for (var i = 0; i < names.length; i++)
                {
                    if (cell.c4 && cell.c4.applyForm){
                        removeLabel = removeLabel || cell.c4.applyForm(value, names[i], texts[i]);
                    } else {
                        if (texts[i] == null)
                        {
                            value.removeAttribute(names[i]);
                        }
                        else
                        {
                            value.setAttribute(names[i], texts[i].value);
                            removeLabel = removeLabel || (names[i] == 'placeholder' &&
                                value.getAttribute('placeholders') == '1');
                        }
                    }
                }

                // Removes label if placeholder is assigned
                if (removeLabel)
                {
                    value.removeAttribute('label');
                }

                // Updates the value of the cell (undoable)
                graph.getModel().setValue(cell, value);
            }
            catch (e)
            {
                mxUtils.alert(e);
            }
        });
        applyBtn.className = 'geBtn gePrimaryBtn';

        var buttons = document.createElement('div');
        buttons.style.marginTop = '18px';
        buttons.style.textAlign = 'right';

        if (graph.getModel().isVertex(cell) || graph.getModel().isEdge(cell))
        {
            var replace = document.createElement('span');
            replace.style.marginRight = '10px';
            var input = document.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.style.marginRight = '6px';

            if (value.getAttribute('placeholders') == '1')
            {
                input.setAttribute('checked', 'checked');
                input.defaultChecked = true;
            }

            mxEvent.addListener(input, 'click', function()
            {
                if (value.getAttribute('placeholders') == '1')
                {
                    value.removeAttribute('placeholders');
                }
                else
                {
                    value.setAttribute('placeholders', '1');
                }
            });

            replace.appendChild(input);
            mxUtils.write(replace, mxResources.get('placeholders'));

            if (EditDataDialog.placeholderHelpLink != null)
            {
                var link = document.createElement('a');
                link.setAttribute('href', EditDataDialog.placeholderHelpLink);
                link.setAttribute('title', mxResources.get('help'));
                link.setAttribute('target', '_blank');
                link.style.marginLeft = '10px';
                link.style.cursor = 'help';

                var icon = document.createElement('img');
                icon.setAttribute('border', '0');
                icon.setAttribute('valign', 'middle');
                icon.style.marginTop = '-4px';
                icon.setAttribute('src', Editor.helpImage);
                link.appendChild(icon);

                replace.appendChild(link);
            }

            buttons.appendChild(replace);
        }

        if (ui.editor && ui.editor.cancelFirst)
        {
            buttons.appendChild(cancelBtn);
            buttons.appendChild(applyBtn);
        }
        else
        {
            buttons.appendChild(applyBtn);
            buttons.appendChild(cancelBtn);
        }

        div.appendChild(buttons);
        this.container = div;
    }


    ///// END <- CUSTOM EDITOR FORM




    /* Finding assigned keys:

      * Open javascript console
      * Draw.valueOf()
      * Traverse to: Object > loadPlugin > <function scope>
                    > ui > keyHandler > controlShiftKeys
      * The number here is ASCII character code
    */

    // Adds resources for actions
/*    mxResources.parse('myInsertText=Insert text element');
    mxResources.parse('myInsertEllipse=Insert ellipse');*/

    // Adds action : myInsertEllipse
/*    ui.actions.addAction('myInsertEllipse', function() {
        var theGraph = ui.editor.graph;
        if(theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())){
            var pos=theGraph.getInsertPoint();
            var newElement=new mxCell("",
                new mxGeometry(pos.x, pos.y, 80, 80),
                "ellipse;whiteSpace=wrap;html=1;");

            newElement.vertex=!0;
            theGraph.setSelectionCell(theGraph.addCell(newElement))
        }
    }, null, null, "Ctrl+Shift+Q");

    ui.keyHandler.bindAction(81, !0, "myInsertEllipse", !0);

    ui.actions.addAction('myInsertText', function() {
        var theGraph = ui.editor.graph;
        if(theGraph.isEnabled() && !theGraph.isCellLocked(theGraph.getDefaultParent())){
            var pos=theGraph.getInsertPoint();
            var newElement=new mxCell("",
                new mxGeometry(pos.x, pos.y, 80, 80),
                "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;whiteSpace=wrap;overflow=auto");

            newElement.vertex=!0;
            theGraph.setSelectionCell(theGraph.addCell(newElement))
        }
    }, null, null, "Ctrl+Shift+T");

    ui.keyHandler.bindAction(84, !0, "myInsertText", !0);*/

    // Adds menu
/*    ui.menubar.addMenu('My Menu', function(menu, parent) {
        ui.menus.addMenuItem(menu, 'myInsertText');
        ui.menus.addMenuItem(menu, 'myInsertEllipse');
    });*/

    // Reorders menubar
/*    ui.menubar.container
        .insertBefore(ui.menubar.container.lastChild,
            ui.menubar.container.lastChild.previousSibling.previousSibling);*/
});
