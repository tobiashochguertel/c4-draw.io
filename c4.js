
/**
 * Draw.io Plugin to create C4 Architecture Diagramms
 *
 * LOAD C4 SHAPE LIBRARY:
 *
 * https://raw.githubusercontent.com/tobiashochguertel/draw-io/master/C4-drawIO.xml
 */
Draw.loadPlugin(function (ui) {
    var sidebar_id = 'c4';
    var sidebar_title = 'C4 Notation';

    var c4Utils = {};
    c4Utils.isC4 = function (cell) {
        return (cell &&
            cell.hasOwnProperty('c4') &&
            (cell.c4 !== null));
    };
    c4Utils.isC4Model = function (cell) {
        return (c4Utils.isC4(cell) &&
            cell &&
            cell.hasOwnProperty('value') &&
            (cell.value &&
                cell.value.hasAttribute('c4Type'))
        );
    };
    c4Utils.isC4Person = function (cell) {
        return (c4Utils.isC4(cell) &&
            (cell.hasOwnProperty('value') &&
                cell.value.length === 0 ) &&
            cell.getChildCount() === 2 &&
            cell.getChildAt(0).value.getAttribute('c4Type') === 'body');
    };
    c4Utils.isC4SoftwareSystem = function (cell) {
        return (c4Utils.isC4(cell) &&
            cell.getAttribute('c4Type') === 'SoftwareSystem');
    };
    c4Utils.isC4Relationship = function (cell) {
        return (c4Utils.isC4(cell) &&
            cell.getAttribute('c4Type') === 'Relationship');
    };

    c4Utils.createSettingsIcon = function () {
        var img = mxUtils.createImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAACpklEQVRIS7VVMU9TURg9nWiZoF0k1MQmlKCREhhowUHaScpWdYHoINUORoKTiT+AhMnE6IDigraL2g10amGhxaFGMJHQJiWxBJcWJl6Zas4H9/leH4VKwl2a13vv+c73nfN911ar1Wq4oGVrBpzxq9VDnYLd3gKbzXYmpabAs2s5bBWKCAwOIPstJ7/dXs/5wNMrGfh6e+BytgvA4pcU3J0d6PNdRWp5FZpWxdhoSPbKlT2sb2wieHPIEszC/H08iQNNQ6m0i1DwBhwOu4BPP3kgwUo7u+CZ4MiwBMlkc3C52tDqcODeRMQUwAROVvlCEbHohFz8mFyUw2SpsuA3A/AsAblHAnPzcXi7PAiNDOsBTOBMce5tAk+nJuWCceUL2/qnt+uKaY9EXrx8h9jDcRMJS1nIqFLZx51IWAB+rP+SsjB11p2sy+V9YUwNuD4ll+B0tplY838LuHLG/YnbOnA9I5WhCrAQ/4zuLg8C/gFrzenjjZ+bKO38QWYtp4s3M/vakqq6rQI8f/ZYHPNmPoE+3zW4Oy+h93qP9IEwV+Ixutfrkbpt5YtIr6yKuI0W60z29DwD5PNF6Ye7kTHRTAf/Xdo1NQbB6Rzl55MCUAs6xNhQvHfZ3WEGpyhkTSecm3lhW9jTDDpz1pxdRifQHUrA/6k5LUz30FHsbr3mxpTr3bL0NYVHUbN/lYDhW0d2PNUtRvDGPm+XWlKbcnnP5POmwE/rUAqlVv1EpNtmZl9hemqycYcezZZtxKLjMlsoMld4NGiZLenljIj2b7YkxAwNZwuBmKKmHUrqAX8/WtVUPGZF0Rc+JBEaGcKBVkV27TtcrnY4HC1gVxvXiY8FM6BQzcxzBmPJjIxVgKZfIpaLs4Nu8g/2n/8lqu/GC31DGw6XMzb+An4I4cvYKbPGAAAAAElFTkSuQmCC');
        img.setAttribute('title', 'Settings');
        img.style.cursor = 'pointer';
        img.style.width = '16px';
        img.style.height = '16px';
        return img;
    };
    c4Utils.registCodec = function (func) {
        var codec = new mxObjectCodec(new func());
        codec.encode = function (enc, obj) {
            try {
                var data = enc.document.createElement(func.name);
            } catch (e) {
                (window.console && console.error(e));
            }
            return data
        };
        codec.decode = function (dec, node, into) {
            return new func();
        };
        mxCodecRegistry.register(codec);
    };

    c4StateHandler = function (state) {
        mxVertexHandler.apply(this, arguments);
    };
    c4StateHandler.prototype = new mxVertexHandler();
    c4StateHandler.prototype.constructor = c4StateHandler;
    c4StateHandler.prototype.domNode = null;
    c4StateHandler.prototype.init = function () {
        mxVertexHandler.prototype.init.apply(this, arguments);
        this.domNode = document.createElement('div');
        this.domNode.style.position = 'absolute';
        this.domNode.style.whiteSpace = 'nowrap';
        if (this.custom) this.custom.apply(this, arguments);
        var img = c4Utils.createSettingsIcon();
        mxEvent.addGestureListeners(img,
            mxUtils.bind(this, function (evt) {
                mxEvent.consume(evt);
            })
        );
        mxEvent.addListener(img, 'click',
            mxUtils.bind(this, function (evt) {
                var isC4Person = c4Utils.isC4Person(this.state.cell);
                if (isC4Person) {
                    var cell = this.state.cell.getChildAt(0);
                    if (cell !== null) {
                        var dlg = new EditDataDialog(ui, cell);
                        ui.showDialog(dlg.container, 320, 320, true, false);
                        dlg.init();
                    }
                }
                if (!isC4Person) {
                    ui.actions.get('editData').funct();
                }
                mxEvent.consume(evt);
            })
        );
        this.domNode.appendChild(img);
        this.graph.container.appendChild(this.domNode);
        this.redrawTools();
    };
    c4StateHandler.prototype.redraw = function () {
        mxVertexHandler.prototype.redraw.apply(this);
        this.redrawTools();
    };
    c4StateHandler.prototype.redrawTools = function () {
        if (this.state !== null && this.domNode !== null) {
            var dy = (mxClient.IS_VML && document.compatMode === 'CSS1Compat') ? 20 : 4;
            this.domNode.style.left = (this.state.x + this.state.width - this.domNode.children.length * 14) + 'px';
            this.domNode.style.top = (this.state.y + this.state.height + dy) + 'px';
        }
    };
    c4StateHandler.prototype.destroy = function (sender, me) {
        mxVertexHandler.prototype.destroy.apply(this, arguments);
        if (this.domNode !== null) {
            this.domNode.parentNode.removeChild(this.domNode);
            this.domNode = null;
        }
    };

    C4Person = function () {
    };
    C4Person.prototype.handler = c4StateHandler;
    C4Person.prototype.create = function () {
        var group = new mxCell('', new mxGeometry(0, 0, 160, 180), 'group;rounded=0;labelBackgroundColor=none;fillColor=none;fontColor=#000000;align=center;html=1;');
        group.setVertex(true);
        group.setConnectable(false);
        group.setAttribute('c4Type', 'person');
        group.c4 = this;
        var body = new mxCell('', new mxGeometry(0, 70, 160, 110), 'rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#dae8fc;fontColor=#000000;align=center;arcSize=33;strokeColor=#6c8ebf;');
        body.setParent(group);
        body.setVertex(true);
        body.setValue(mxUtils.createXmlDocument().createElement('object'));
        body.setAttribute('label', '<b>name</b><div>[Person]</div><div><br></div><div>Beschreibung</div>');
        body.setAttribute('placeholders', '1');
        body.setAttribute('c4Name', 'name');
        body.setAttribute('c4Type', 'body');
        body.setAttribute('c4Description', 'Beschreibung');
        body.c4 = this;
        var head = new mxCell('', new mxGeometry(40, 0, 80, 80), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;rounded=0;labelBackgroundColor=none;fillColor=#dae8fc;fontSize=12;fontColor=#000000;align=center;strokeColor=#6c8ebf;');
        head.setParent(group);
        head.setVertex(true);
        head.setAttribute('c4Type', 'head');
        head.c4 = this;
        group.insert(head);
        group.insert(body); // child: 0 !!
        return group;
    };
    c4Utils.registCodec(C4Person);

    C4SoftwareSystem = function () {
    };
    C4SoftwareSystem.prototype.handler = c4StateHandler;
    C4SoftwareSystem.prototype.create = function () {
        var c4SoftwareSystem = new mxCell('', new mxGeometry(0, 70, 160, 110), 'rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#dae8fc;fontColor=#000000;align=center;arcSize=7;strokeColor=#6c8ebf;');
        c4SoftwareSystem.setVertex(true);
        c4SoftwareSystem.setValue(mxUtils.createXmlDocument().createElement('object'));
        c4SoftwareSystem.setAttribute('label', '<b>name</b><div>[Software System]</div><div><br></div><div>Beschreibung</div>');
        c4SoftwareSystem.setAttribute('placeholders', '1');
        c4SoftwareSystem.setAttribute('c4Name', 'name');
        c4SoftwareSystem.setAttribute('c4Type', 'SoftwareSystem');
        c4SoftwareSystem.setAttribute('c4Description', 'Beschreibung');
        c4SoftwareSystem.c4 = this;
        return c4SoftwareSystem;
    };
    c4Utils.registCodec(C4SoftwareSystem);

    C4Container = function () {
    };
    C4Container.prototype.handler = c4StateHandler;
    C4Container.prototype.create = function () {
        var c4Container = new mxCell('', new mxGeometry(0, 70, 160, 110), 'rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#dae8fc;fontColor=#000000;align=center;arcSize=6;strokeColor=#6c8ebf;');
        c4Container.setVertex(true);
        c4Container.setValue(mxUtils.createXmlDocument().createElement('object'));
        c4Container.setAttribute('label', '<span><b>name</b></span><div>[Container:&nbsp;<span>technology</span><span>]</span></div><div><br></div><div>Beschreibung</div>');
        c4Container.setAttribute('placeholders', '1');
        c4Container.setAttribute('c4Name', 'name');
        c4Container.setAttribute('c4Type', 'Container');
        c4Container.setAttribute('c4Technology', 'technology');
        c4Container.setAttribute('c4Description', 'Beschreibung');
        c4Container.c4 = this;
        return c4Container;
    };
    c4Utils.registCodec(C4Container);

    C4Component = function () {
    };
    C4Component.prototype.handler = c4StateHandler;
    C4Component.prototype.create = function () {
        var c4Component = new mxCell('', new mxGeometry(0, 70, 160, 110), 'rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#dae8fc;fontColor=#000000;align=center;arcSize=7;strokeColor=#6c8ebf;');
        c4Component.setVertex(true);
        c4Component.setValue(mxUtils.createXmlDocument().createElement('object'));
        c4Component.setAttribute('label', '<span><b>name</b></span><div>[Component:&nbsp;<span>technology</span><span>]</span></div><div><br></div><div>Beschreibung</div>');
        c4Component.setAttribute('placeholders', '1');
        c4Component.setAttribute('c4Name', 'name');
        c4Component.setAttribute('c4Type', 'Component');
        c4Component.setAttribute('c4Technology', 'technology');
        c4Component.setAttribute('c4Description', 'Beschreibung');
        c4Component.c4 = this;
        return c4Component;
    };
    c4Utils.registCodec(C4Component);

    C4ExecutionEnvironment = function () {
    };
    C4ExecutionEnvironment.prototype.handler = c4StateHandler;
    C4ExecutionEnvironment.prototype.create = function () {
        var c4ExecutionEnvironment = new mxCell('', new mxGeometry(0, 70, 200, 170), 'rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#ffffff;fontColor=#000000;align=left;arcSize=3;strokeColor=#000000;verticalAlign=bottom;');
        c4ExecutionEnvironment.setVertex(true);
        c4ExecutionEnvironment.setValue(mxUtils.createXmlDocument().createElement('object'));
        c4ExecutionEnvironment.setAttribute('label', '<div style="text-align: left">name</div><div style="text-align: left">[applicationAndVersion]</div>');
        c4ExecutionEnvironment.setAttribute('placeholders', '1');
        c4ExecutionEnvironment.setAttribute('c4Name', 'name');
        c4ExecutionEnvironment.setAttribute('c4Type', 'ExecutionEnvironment');
        c4ExecutionEnvironment.setAttribute('c4Application', 'applicationAndVersion');
        c4ExecutionEnvironment.c4 = this;
        return c4ExecutionEnvironment;
    };
    c4Utils.registCodec(C4ExecutionEnvironment);

    C4DeploymentNode = function () {
    };
    C4DeploymentNode.prototype.handler = c4StateHandler;
    C4DeploymentNode.prototype.create = function () {
        var c4DeploymentNode = new mxCell('', new mxGeometry(0, 70, 240, 230), 'rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#ffffff;fontColor=#000000;align=left;arcSize=3;strokeColor=#000000;verticalAlign=bottom;');
        c4DeploymentNode.setVertex(true);
        c4DeploymentNode.setValue(mxUtils.createXmlDocument().createElement('object'));
        c4DeploymentNode.setAttribute('label', '<div style="text-align: left">hostname</div><div style="text-align: left">[operationSystem]</div><div style="text-align: right">scalingFactor</div>');
        c4DeploymentNode.setAttribute('placeholders', '1');
        c4DeploymentNode.setAttribute('c4Name', 'hostname');
        c4DeploymentNode.setAttribute('c4Type', 'DeploymentNode');
        c4DeploymentNode.setAttribute('c4OperationSystem', 'operationSystem');
        c4DeploymentNode.setAttribute('c4ScalingFactor', 'scalingFactor');
        c4DeploymentNode.c4 = this;
        return c4DeploymentNode;
    };
    c4Utils.registCodec(C4DeploymentNode);

    C4Database = function () {
    };
    C4Database.prototype.handler = c4StateHandler;
    C4Database.prototype.create = function () {
        var c4Database = new mxCell('', new mxGeometry(0, 70, 160, 140), 'shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;rounded=0;labelBackgroundColor=none;fillColor=#dae8fc;fontSize=12;fontColor=#000000;align=center;strokeColor=#6c8ebf;');
        c4Database.setVertex(true);
        c4Database.setValue(mxUtils.createXmlDocument().createElement('object'));
        c4Database.setAttribute('label', '<span>Database</span><div>[Container:&nbsp;technology]</div><div><br></div><div>Beschreibung</div>');
        c4Database.setAttribute('placeholders', '1');
        c4Database.setAttribute('c4Type', 'Database');
        c4Database.setAttribute('c4Technology', 'technology');
        c4Database.setAttribute('c4Description', 'Beschreibung');
        c4Database.c4 = this;
        return c4Database;
    };
    c4Utils.registCodec(C4Database);

    C4Relationship = function () {
    };
    C4Relationship.prototype.handler = c4StateHandler;
    C4Relationship.prototype.create = function () {
        var label = '<div style="text-align: left"><div style="text-align: center"><b>Beschreibung</b></div><div style="text-align: center">[technology]</div></div>';
        var cell = new mxCell('', new mxGeometry(0, 0, 160, 0), 'edgeStyle=none;rounded=0;html=1;entryX=0;entryY=0.5;jettySize=auto;orthogonalLoop=1;strokeColor=#A8A8A8;strokeWidth=2;fontColor=#000000;jumpStyle=none;dashed=1;');
        cell.setValue(mxUtils.createXmlDocument().createElement('object'));
        cell.geometry.setTerminalPoint(new mxPoint(0, 0), true);
        cell.geometry.setTerminalPoint(new mxPoint(160, 0), false);
        cell.geometry.relative = true;
        cell.edge = true;
        cell.value.setAttribute('label', label);
        cell.value.setAttribute('c4Type', 'Relationship');
        cell.value.setAttribute('c4Description', 'Beschreibung');
        cell.value.setAttribute('c4Technology', 'technology');
        cell.c4 = this;
        return cell;
    };
    c4Utils.registCodec(C4Relationship);

    // Adds custom sidebar entry
    ui.sidebar.addPalette(sidebar_id, sidebar_title, true, function (content) {
        var verticies = [C4Person, C4SoftwareSystem, C4Container, C4Component, C4ExecutionEnvironment, C4DeploymentNode, C4Database];
        for (var i in verticies) {
            var cell = verticies[i].prototype.create();
            content.appendChild(ui.sidebar.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, cell.label));
        }
        content.appendChild(ui.sidebar.createEdgeTemplateFromCells([C4Relationship.prototype.create()], 160, 0, 'C4 Relationship'));
        // , C4DynamicRelationship];
    });

    // Add custom handler-code for the event of data-editor instanzing to provide a custom data-editor dialog.
    origGraphCreateHander = ui.editor.graph.createHandler;
    ui.editor.graph.createHandler = function (state) {
        if (state !== null && (this.getSelectionCells().length === 1) && c4Utils.isC4(state.cell) && state.cell.c4.handler
            && !c4Utils.isC4Relationship(state.cell)) {
            return new state.cell.c4.handler(state);
        }
        return origGraphCreateHander.apply(this, arguments);
    };

    // START -> CUSTOM EDITOR MENU!
    origEditDataDialog = EditDataDialog;
    EditDataDialog = function (ui, cell) {
        if (!c4Utils.isC4(cell)) {
            return origEditDataDialog.apply(this, arguments);
        }
        var div = document.createElement('div');
        var graph = ui.editor ? ui.editor.graph : ui.graph;
        div.style.height = '100%'; //'310px';
        div.style.overflow = 'auto';
        var value = graph.getModel().getValue(cell);
        // Converts the value to an XML node
        if (!mxUtils.isNode(value)) {
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
        var addTextArea = function (index, name, value, tabIndex) {
            names[index] = name;
            texts[index] = form.addTextarea(names[count] + ':', value, 2);
            texts[index].style.width = '100%';
            texts[index].tabIndex = tabIndex;
            return texts[index];
        };
        var addText = function (index, name, value, tabIndex) {
            names[index] = name;
            texts[index] = form.addText(names[count] + ':', value);
            texts[index].style.width = '100%';
            texts[index].tabIndex = tabIndex;
            return texts[index];
        };
        var addAttribute = function (index, name, value) {
            names[index] = name;
            texts[index] = document.createElement('textarea');
            texts[index].value = value;
            return texts[index];
        };
        for (var i = 0; i < attrs.length; i++) {
            var nodeName = attrs[i].nodeName;
            var nodeValue = attrs[i].nodeValue;
            // if (cell.awssf.hiddenAttributes && cell.awssf.hiddenAttributes.indexOf(nodeName) >= 0) continue;
            if (nodeName === 'c4Type') {
                var span = document.createElement('span');
                mxUtils.write(span, nodeValue);
                form.addField('c4Type:', span);
            } else if (nodeName === 'label') {
                addAttribute(count, nodeName, nodeValue);
                count++;
                var labelDiv = document.createElement('div');
                labelDiv.setAttribute('style', 'border: 1px dashed #c2c2c2; margin-bottom: 4px;');
                labelDiv.innerHTML = nodeValue;
                div.appendChild(labelDiv);
            }
            else if (nodeName !== 'placeholders') {
                addTextArea(count, nodeName, nodeValue, i);
                count++;
            }
        }
        div.appendChild(form.table);
        this.init = function () {
            function getIndexOfC4Type(c4type) {
                for (var i = 0; i < names.length; i++) {
                    if (names[i] === c4type) { //'c4Name'
                        return i;
                    }
                }
            }

            var firstInputField = -1;
            switch (cell.getAttribute('c4Type')) {
                case 'body':
                case 'SoftwareSystem':
                case 'Container':
                case 'Component':
                case 'ExecutionEnvironment':
                case 'DeploymentNode':
                    firstInputField = getIndexOfC4Type('c4Name');
                    break;
                case 'Relationship':
                    firstInputField = getIndexOfC4Type('c4Description');
                    break;
                case 'DynamicRelationship':
                    firstInputField = getIndexOfC4Type('c4Step');
                    break;
                case 'Database':
                    firstInputField = getIndexOfC4Type('c4Technology');
                    break;
            }
            if (texts.length > 0 && firstInputField !== -1) {
                texts[firstInputField].focus();
            }
        };
        var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
            ui.hideDialog.apply(ui, arguments);
        });
        cancelBtn.className = 'geBtn';
        var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
            try {
                ui.hideDialog.apply(ui, arguments);
                // Clones and updates the value
                value = value.cloneNode(true);
                var removeLabel = false;
                var c4NotationUpdate = function () {
                    var c4Name = '';
                    var c4Description = '';
                    var c4Technology = '';
                    var c4OperationSystem = '';
                    var c4Application = '';
                    var c4ScalingFactor = '';
                    var c4Step = 1;
                    var labelIndex = -1;
                    for (var i = 0; i < names.length; i++) {
                        if (names[i] === 'c4Name') {
                            c4Name = texts[i].value;
                        }
                        if (names[i] === 'c4Description') {
                            c4Description = texts[i].value;
                        }
                        if (names[i] === 'c4Technology') {
                            c4Technology = texts[i].value;
                        }
                        if (names[i] === 'c4OperationSystem') {
                            c4OperationSystem = texts[i].value;
                        }
                        if (names[i] === 'c4Application') {
                            c4Application = texts[i].value;
                        }
                        if (names[i] === 'c4ScalingFactor') {
                            c4ScalingFactor = texts[i].value;
                        }
                        if (names[i] === 'c4Step') {
                            c4Step = texts[i].value;
                        }
                        if (names[i] === 'label') {
                            labelIndex = i;
                        }
                    }
                    if (labelIndex >= 0) {
                        switch (cell.getAttribute('c4Type')) {
                            case 'body':
                                texts[labelIndex].value = c4Name + '<div>[Person]</div><div><br></div><div>' + c4Description;
                                break;
                            case 'SoftwareSystem':
                                texts[labelIndex].value = c4Name + '<div>[Software System]</div><div><br></div><div>' + c4Description;
                                break;
                            case 'Container':
                                texts[labelIndex].value = '<span>' + c4Name + '</span><div>[Container:&nbsp;<span>' + c4Technology + '</span><span>]</span></div><div><br></div><div>' + c4Description + '</div>';
                                break;
                            case 'Component':
                                texts[labelIndex].value = '<span>' + c4Name + '</span><div>[Component:&nbsp;<span>' + c4Technology + '</span><span>]</span></div><div><br></div><div>' + c4Description + '</div>';
                                break;
                            case 'Relationship':
                                texts[labelIndex].value = '<div style="text-align: left"><div style="text-align: center"><b>' + c4Description + '</b></div><div style="text-align: center">[' + c4Technology + ']</div></div>';
                                break;
                            case 'ExecutionEnvironment':
                                texts[labelIndex].value = '<div style="text-align: left">' + c4Name + '</div><div style="text-align: left">[' + c4Application + ']</div>';
                                break;
                            case 'DeploymentNode':
                                texts[labelIndex].value = '<div style="text-align: left">' + c4Name + '</div><div style="text-align: left">[' + c4OperationSystem + ']</div><div style="text-align: right">' + c4ScalingFactor + '</div>';
                                break;
                            case 'DynamicRelationship':
                                texts[labelIndex].value = '<bold>' + c4Step + ': </bold><bold>' + c4Description + '</bold>' + '<div>[' + c4Technology + ']</div><div><br></div><div>';
                                break;
                            case 'Database':
                                texts[labelIndex].value = '<span>Database</span><div>[Container:&nbsp;' + c4Technology + ']</div><div><br></div><div>' + c4Description + '</div>';
                                break;
                        }
                    }
                }();
                for (var i = 0; i < names.length; i++) {
                    if (cell.c4 && cell.c4.applyForm) {
                        removeLabel = removeLabel || cell.c4.applyForm(value, names[i], texts[i]);
                    } else {
                        if (texts[i] === null) {
                            value.removeAttribute(names[i]);
                        }
                        else {
                            value.setAttribute(names[i], texts[i].value);
                            removeLabel = removeLabel || (names[i] === 'placeholder' &&
                                value.getAttribute('placeholders') === '1');
                        }
                    }
                }
                // Removes label if placeholder is assigned
                if (removeLabel) {
                    value.removeAttribute('label');
                }
                // Updates the value of the cell (undoable)
                graph.getModel().setValue(cell, value);
            }
            catch (e) {
                mxUtils.alert(e);
            }
        });
        applyBtn.className = 'geBtn gePrimaryBtn';
        applyBtn.tabIndex = 10;
        var buttons = document.createElement('div');
        buttons.style.marginTop = '18px';
        buttons.style.textAlign = 'right';

        if (graph.getModel().isVertex(cell) || graph.getModel().isEdge(cell)) {
            var replace = document.createElement('span');
            replace.style.marginRight = '10px';
            var input = document.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.style.marginRight = '6px';
            if (value.getAttribute('placeholders') === '1') {
                input.setAttribute('checked', 'checked');
                input.defaultChecked = true;
            }
            mxEvent.addListener(input, 'click', function () {
                if (value.getAttribute('placeholders') === '1') {
                    value.removeAttribute('placeholders');
                }
                else {
                    value.setAttribute('placeholders', '1');
                }
            });
            replace.appendChild(input);
            mxUtils.write(replace, mxResources.get('placeholders'));
            if (EditDataDialog.placeholderHelpLink !== null) {
                var createHelpIcon = function () {
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
                }();
            }
            buttons.appendChild(replace);
        }
        if (ui.editor && ui.editor.cancelFirst) {
            buttons.appendChild(cancelBtn);
            buttons.appendChild(applyBtn);
        }
        else {
            buttons.appendChild(applyBtn);
            buttons.appendChild(cancelBtn);
        }
        div.appendChild(buttons);
        this.container = div;
    }
    ///// END <- CUSTOM EDITOR FORM
});
