# C4 Modelling little bit easier (c4-draw.io)

## About
 You can make C4 Architecture Software System Models with draw.io.
 
 This is a C4 Modelling plugin for [draw.io](https://github.com/tobiashochguertel/c4-draw.io), which provides C4 Notation Elements in draw.io.

## Quick Start
1. Access to https://www.draw.io/.
1. Select Save Option (ex. Decide Later...)
1. Select Menu [Extras]-[Plugins]
1. Click [Add]
1. Input https://raw.githubusercontent.com/tobiashochguertel/c4-draw.io/master/c4.js
1. [Apply]
1. Reload the page

- You can run locally draw.io in the browser too. See details [draw.io Wiki page](https://github.com/jgraph/draw.io/wiki/Building)


## Example
1. Drag and drop a **Start** on a diagram
1. Drag and drop a **Task** on a diagram
1. Select **Task**, and click a **Settings**(gear) icon, and Input params
1. Drag a connection from **Start** to **Task**
1. Drag and drop a **End** on a diagram
1. Drag a connection from **Task** to **End**
1. Menu [StepFunctions]-[Export JSON]
1. Copy the output and paste it to AWS Step Functions management console.

## Usage
### Fields of C4 Notation-Element 
- You can set them with [Edit Data...] on a diagram.

## Credits

- Thanks to [AWS Step Functions Workflow Designer](https://github.com/sakazuki/step-functions-draw.io) which has inspired me to done this plugin.