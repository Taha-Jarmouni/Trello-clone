    import './css/styles.css';
    
    import jsonTasks from "./data.json";
    import addGlobalEventListener from "./utils/addGlobalEventListener.js";
    import setupDragAndDrop from "./dragAndDrop.js";
    import { v4 as uuidV4 }  from "uuid"; // this is library that is going to generate ids of us

    // console.log(jsonTasks);
    // console.log(tasksUpload);


    const lanesContainer = document.querySelector('.lanes')
    const uploadButton = document.getElementById('uploadButton')
    const downloadButton = document.getElementById('downloadButton')
    const addLaneButton = document.getElementById('addLaneButton')
    const laneName = document.getElementById('laneName')
    const h1 = document.querySelector('h1')

    const STORAGE_PREFIX = "TRELLO_CLONE"
    const LANES_STORAGE_KEY = `${STORAGE_PREFIX}-lanes`

    const DEFAULT_LANES = {
      // backlog: [/* { id: uuidV4(), text: "Create your first task" } */],
      // doing: [],
      // done: [],
    }
    
    let lanes = loadLanes()


    Object.entries(lanes).forEach(function (lane) {
      // console.log(lane[0]);
      if ( lane[0] || lane[1].length > 0) {
        createNewLanes(lane[0])
      }
    })



    renderTasks(lanes)

    setupDragAndDrop(onDragComplete)

    addGlobalEventListener("submit", "[data-task-form]", e => {
      e.preventDefault()



      const taskInput = e.target.querySelector("[data-task-input]")
      const taskText = taskInput.value
      if (taskText === "") return

      const task = { id: uuidV4(), text: taskText } 
      const laneElement = e.target.closest(".lane").querySelector("[data-lane-id]")
      lanes[laneElement.dataset.laneId].push(task)

      const taskElement = createTaskElement(task)
      laneElement.append(taskElement)
      taskInput.value = ""

      saveLanes()
    })

    function onDragComplete(e) {
      const startLaneId = e.startZone.dataset.laneId
      const endLaneId = e.endZone.dataset.laneId
      const startLaneTasks = lanes[startLaneId]
      const endLaneTasks = lanes[endLaneId]

      const task = startLaneTasks.find(t => t.id === e.dragElement.id)
      startLaneTasks.splice(startLaneTasks.indexOf(task), 1)
      endLaneTasks.splice(e.index, 0, task) 
 
      saveLanes(); 
    }

    function loadLanes() {
      const lanesJson = localStorage.getItem(LANES_STORAGE_KEY)
      return JSON.parse(lanesJson) || DEFAULT_LANES
    }

    function saveLanes() {
      localStorage.setItem(LANES_STORAGE_KEY, JSON.stringify(lanes))
    }

    function renderTasks(lanes) {
      Object.entries(lanes).forEach(obj => { // convert object to an array

        const laneId = obj[0] 
        const tasks = obj[1]
        const lane = document.querySelector(`[data-lane-id="${laneId}"]`)
        // console.log(laneId);
        // console.log(Object.entries(lanes));

        tasks.forEach(task => {
        // Check if the task with the same ID already exists in the lane
          if (!lane.querySelector(`[id="${task.id}"]`)) {
            const taskElement = createTaskElement(task)
            lane.append(taskElement)
          }
        })
      })
    }

    function createTaskElement(task) {
      const element = document.createElement("div")
      element.id = task.id
      element.innerText = task.text
      element.classList.add("task")
      element.dataset.draggable = true
      return element
    }

    // {} Download Trello data as Json file 

    // Add an event listener to the button
    downloadButton.addEventListener('click', () => {

      //  Retrieve data from local storage
      const localStorageData = localStorage.getItem(LANES_STORAGE_KEY); 

      if (localStorageData) {
        try {
          // Convert data to a JSON string
          const jsonData = JSON.stringify(JSON.parse(localStorageData), null, 2);

          // Create a Blob containing the JSON data
          const blob = new Blob([jsonData], { type: 'application/json' });

          // Create an Object URL for the Blob
          const url = URL.createObjectURL(blob);

          // Create a temporary <a> element to trigger the download
          const a = document.createElement('a');
          a.href = url;
          a.download = 'data.json';  

          // Trigger the download
          a.click();

          // Clean up the Object URL
          // URL.revokeObjectURL(url);

        } catch (error) {
          alert('Error parsing or processing data:', error);
        }
      } else {
          alert('No data found in local storage.')
    
      }
    });

    uploadButton.addEventListener('click', () => {
      location.reload();
      
      const existingLanes = loadLanes();
      
      // console.log(existingLanes);

      // Merge the existing data with the new data from jsonTasks
      for (const laneId in jsonTasks) {
        if (jsonTasks.hasOwnProperty(laneId)) {
          if (!existingLanes[laneId]) {
            existingLanes[laneId] = [];
          }
          existingLanes[laneId] = existingLanes[laneId].concat(jsonTasks[laneId]);
        }
      }
      console.log(existingLanes);

      localStorage.setItem(LANES_STORAGE_KEY, JSON.stringify(existingLanes))
      
      lanes = existingLanes;
      
      renderTasks(lanes);
      
      uploadButton.disabled = true

    })

   // Create data.json lanes
    addLaneButton.addEventListener('click', (e) => {
      e.preventDefault()


    if (laneName.value.trim() === '') return

      createNewLanes(laneName.value.trim());

      laneName.value = ''
    }, {ones : true})


    function createNewLanes(laneName) {
      
      h1.style.display = 'none'

      const lane = document.createElement('div');
      lane.classList.add('lane');
    
      const header = document.createElement('div');
      header.classList.add('header');
      header.innerText = laneName  
      const button =  document.createElement('button')
      button.innerText = 'x'  
      button.title = 'Delete lane'  
      button.classList.add('deleteLane')
      header.appendChild(button)

      const tasks = document.createElement('div');
      tasks.classList.add('tasks');
      tasks.setAttribute('data-drop-zone', '');
      tasks.setAttribute('data-lane-id', laneName); 
      
      const form = document.createElement('form');
      form.setAttribute('data-task-form', '');
    
      const input = document.createElement('input');
      input.setAttribute('data-task-input', '');
      input.classList.add('task-input');
      input.type = 'text';
      input.placeholder = 'Task Name';
    
       form.appendChild(input);
      lane.appendChild(header);
      lane.appendChild(tasks);
      lane.appendChild(form);
    
      lanesContainer.appendChild(lane);
    
      // Add New property to lanes object
      const laneId = tasks.dataset.laneId;

      if (!lanes[laneId]) {
        lanes[laneId] = []; // Create a new property for the lane if it doesn't exist
      }

      saveLanes();

      // Attach the submit event listener to the new form
      form.addEventListener('submit', e => {
        e.preventDefault();
    
        const taskInput = e.target.querySelector("[data-task-input]");
        const taskText = taskInput.value;
        if (taskText === "") return;
    
        const task = { id: uuidV4(), text: taskText };

        lanes[laneId].push(task);
    
        console.log(lanes);

        const laneElement = e.target.closest(".lane").querySelector("[data-lane-id]");

        const taskElement = createTaskElement(task);
        laneElement.append(taskElement);
        taskInput.value = "";
    
        saveLanes();
      });
    }


    lanesContainer.addEventListener('click', function(e) {

      
      if (e.target.matches('.deleteLane')) {

        confirm('Are you sure you want to delete this lane !!')
 
        const deleteLane = e.target

        const LaneId = deleteLane.closest(".lane").querySelector("[data-lane-id]")

        const laneContainer = deleteLane.closest(".lane")

        laneContainer.remove()
        // console.log(lanes);

        for (const key in lanes) {
          if (LaneId.dataset.laneId == key) {
            delete lanes[key]

          }
          // console.log(lanes);
          
        }
        console.log(lanes);
        
        // Object.entries(lanes).forEach((lane) => {

        //   if (LaneId.dataset.laneId == lane[0]) {
        //      // console.log(Object.entries(lanes) );
        //     Object.entries(lanes)[0].splice(Object.entries(lanes)[0].indexOf(lane[0]) , 0)
        //     }
        //  }) 

        // console.log(LaneId.dataset.laneId);
        saveLanes()

      }
    })

