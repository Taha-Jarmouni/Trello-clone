import addGlobalEventListener from "./utils/addGlobalEventListener.js"

export default function setup(onDragComplete) {
  addGlobalEventListener("mousedown", "[data-draggable]", e => {
    const selectedItem = e.target

    const itemClone = selectedItem.cloneNode(true)

    const ghost = selectedItem.cloneNode()

    const offset = setupDragItems(selectedItem, itemClone,ghost, e)
    
    setupDragEvents(selectedItem, itemClone, ghost, offset, onDragComplete)
  })
}


function setupDragItems(selectedItem, itemClone, ghost, e) {
  const originalRect = selectedItem.getBoundingClientRect() //the bounding of the sellected element 
  // console.log(e.clientY);
  // console.log("###########");
  // console.log(originalRect.top);
  // console.log("###########");
  // console.log(originalRect.top + originalRect.height / 2);
  
  const offset = {
    x: e.clientX - originalRect.left,
    y: e.clientY - originalRect.top,
  }

  itemClone.style.width = `${originalRect.width}px`
  itemClone.classList.add("dragging") 
 
  positionClone(itemClone, e, offset)

  document.body.append(itemClone)
  selectedItem.classList.add("hide")
  ghost.style.height = `${originalRect.height}px`
  ghost.classList.add("ghost") 
  ghost.innerHTML = ""
  selectedItem.parentElement.insertBefore(ghost, selectedItem)

  return offset


}

function setupDragEvents(selectedItem, itemClone, ghost, offset, onDragComplete){

  const mouseMoveFunction = e => {  //follow every place that i go to
    positionClone(itemClone, e, offset)

    const dropZone = getDropZone(e.target)    
    if (dropZone == null) return

    const closestChild = Array.from(dropZone.children).find(child => {
      const rect = child.getBoundingClientRect()
      // console.log(rect.top + rect.height / 2);
      return e.clientY < rect.top + rect.height / 2
      
      //it is realy hard to understand this if you forget it, Meli l mouse kiwsal lwa7d top li hwa top dial child
      // element plus l height kamel dial l element / 2 (m9som 3la joj) 
      // m3loma mohima kol ma hbati b l mouse vertical kol ma number kizid ykbar
      // y3ni fel mital lwl f task tani 85 ghadi tkon ta7t men 72 o 72 hwa top dial task 2  
      
    })
 
    // console.log(closestChild);
    if (closestChild != null) {
      dropZone.insertBefore(ghost, closestChild)
    } else {
      dropZone.append(ghost)
    }
  
  
  }

  document.addEventListener('mousemove', mouseMoveFunction)

  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', mouseMoveFunction)
    // console.log('Up');

    const dropZone = getDropZone(ghost) 
    // we want to get our drop zone of where our ghost at
    // what drop zone our ghost currently in 

    if (dropZone) {  // if the ghost inside the drop zone
      onDragComplete({
        startZone: getDropZone(selectedItem), // in here is still in it's original zone we still didn't move it yet bc we are going to move it after this onDragComplete function 
        endZone: dropZone,
        dragElement: selectedItem,
        index: Array.from(dropZone.children).indexOf(ghost),
      })
      dropZone.insertBefore(selectedItem, ghost)
      // make the selected task or  element take the place of the ghost this is heppend after
      // we get information about the selectedItem

    }

    stopDrag(selectedItem, itemClone, ghost)

  }, {once: true})
}

function positionClone(itemClone, mousePosition, offset) {
  itemClone.style.top = `${mousePosition.clientY - offset.y}px`
  itemClone.style.left = `${mousePosition.clientX - offset.x}px`
}


function stopDrag(selectedItem, itemClone, ghost) {
  selectedItem.classList.remove("hide")
  itemClone.remove()
  ghost.remove()
}


function getDropZone(element) {
  if (element.matches("[data-drop-zone]")){ 
    return element
    // if the current element that you currently hover on equal to [data-drop-zone] 
    // which is the tasks container return it 

    /*
    in the other words 

    */

  } else {
    return element.closest("[data-drop-zone]") // else return the 
  }
}



 
/*
import addGlobalEventListener from "./utils/addGlobalEventListener.js"

export default function setup() {
  addGlobalEventListener("mousedown", "[data-draggable]", e => {
    const selectedItem = e.target

    const itemClone = selectedItem.cloneNode(true)

    const ghost = selectedItem.cloneNode()

    const offset = setupDragItems(selectedItem, itemClone,ghost, e)
    
    setupDragEvents(selectedItem, itemClone, ghost, offset)
 
   
    
    
    
  })
}


function setupDragItems(selectedItem, itemClone, ghost, e) {
  const originalRect = selectedItem.getBoundingClientRect() //the bounding of the sellected element 
  console.log(e.clientY);
  console.log("###########");
  console.log(originalRect.top);
  console.log("###########");
  console.log(originalRect.top + originalRect.height / 2);
  
  const offset = {
    x: e.clientX - originalRect.left,
    y: e.clientY - originalRect.top,
  }

  itemClone.style.width = `${originalRect.width}px`
  itemClone.classList.add("dragging") 
 
  positionClone(itemClone, e, offset)

  document.body.append(itemClone)
  selectedItem.classList.add("hide")
  ghost.style.height = `${originalRect.height}px`
  ghost.classList.add("ghost") 
  ghost.innerHTML = ""
  selectedItem.parentElement.insertBefore(ghost, selectedItem)

  return offset


}

function setupDragEvents(selectedItem, itemClone, ghost, offset){

  const mouseMoveFunction = e => {  //follow every place that i go to
    positionClone(itemClone, e, offset)

    const dropZone = getDropZone(e.target)    
    if (dropZone == null) return

    const closestChild = Array.from(dropZone.children).find(child => {
      const rect = child.getBoundingClientRect()
      console.log(rect.top + rect.height / 2);
      return e.clientY < rect.top + rect.height / 2
      
      //it is realy hard to understand this if you forget it, Meli l mouse kiwsal lwa7d top li hwa top dial child
      // element plus l height kamel dial l element / 2 (m9som 3la joj) 
      // m3loma mohima kol ma hbati b l mouse vertical kol ma number kizid ykbar
      // y3ni fel mital lwl f task tani 85 ghadi tkon ta7t men 72 o 72 hwa top dial task 2  
      
    })
 
    console.log(closestChild);
    if (closestChild != null) {
      dropZone.insertBefore(ghost, closestChild)
    } else {
      dropZone.append(ghost)
    }
  
  
  }

  document.addEventListener('mousemove', mouseMoveFunction)

  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', mouseMoveFunction)
    // console.log('Up');

    const dropZone = getDropZone(ghost)
    if (dropZone) {
      dropZone.insertBefore(selectedItem, ghost)
    }

    stopDrag(selectedItem, itemClone, ghost)

  }, {once: true})
}

function positionClone(itemClone, mousePosition, offset) {
  itemClone.style.top = `${mousePosition.clientY - offset.y}px`
  itemClone.style.left = `${mousePosition.clientX - offset.x}px`
}


function stopDrag(selectedItem, itemClone, ghost) {
  selectedItem.classList.remove("hide")
  itemClone.remove()
  ghost.remove()
}


function getDropZone(element) {
  if (element.matches("[data-drop-zone]")){ 
    return element
    // if the current element that you currently hover on equal to [data-drop-zone] 
    // which is the tasks container return it 

  } else {
    return element.closest("[data-drop-zone]") // else return the 
  }
}

*/