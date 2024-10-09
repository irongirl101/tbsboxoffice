//this file is for parents' selecition of seats 
var block = document.getElementById("blocked-data");//getting blocked from the hidden form on the html.
var blocked = JSON.parse(block.value);//im using the json as its a dict, and this is what works best according to what I have learnt

//[5,7,5] relates to the number of seats in a column 1,2 and 3 respectively. 
//"blocked.X" checks which seats have been blocked/reserved in the database, and is parsed as JSON data, for the correct style and function to be applied on. 
//This data makes the entire auditorium.
const seatingData = [
  { seats: [5, 7, 5], reservedSeats: blocked.A }, //A
  { seats: [5, 7, 5], reservedSeats: blocked.B}, //B
  { seats: [5, 8, 5], reservedSeats: blocked.C }, //C
  { seats: [5, 9, 5], reservedSeats: blocked.D }, //D
  { seats: [5, 9, 5], reservedSeats: blocked.E }, //E
  { seats: [6, 10, 6], reservedSeats: blocked.F }, //F
  { seats: [5, 11, 5], reservedSeats: blocked.G }, //G
  { seats: [6, 11, 6], reservedSeats: blocked.H }, //H
  { seats: [6, 12, 6], reservedSeats: blocked.I }, //I
  { seats: [7, 12, 7], reservedSeats: blocked.J }, //J
  { seats: [7, 12, 7], reservedSeats: blocked.K }, //K
  { seats: [7, 13, 7], reservedSeats: blocked.L }, //L
  { seats: [7, 14, 7], reservedSeats: blocked.M }, //M
  { seats: [6, 15, 6], reservedSeats: blocked.N }, //N
  { seats: [31], reservedSeats: blocked.O }, //O
  { seats: [0, 12, 0], reservedSeats: blocked.AA }, //AA
  { seats: [4, 12, 6], reservedSeats: blocked.BB }, //BB
  { seats: [6, 12, 7], reservedSeats: blocked.CC }, //CC
  { seats: [6, 12, 6], reservedSeats: blocked.DD }, //DD
  { seats: [6, 12, 6], reservedSeats: blocked.EE }, //EE
  { seats: [18, 0, 6], reservedSeats: blocked.FF }, //FF
  
];

//Originally, the row numbers were in integers. In order to convert '1'5 to A5(for example), this function's required. 
function convertToCharacter(rowIndex) { //row index relates to '1' in '1'5
  if (rowIndex <= 14) {//as it starts to become AA5 (for example) in the balcony after 'O'
    return String.fromCharCode(65 + rowIndex); // A-Z
  } else { //AA,BB,CC..Balcony seats. 
    const rangeStart = 15
   

    const secondCharIndex = (rowIndex - rangeStart) % 26;//this is to find the index in form of a float, in order to be calculated in ASCII value

    const secondChar = String.fromCharCode(65 + secondCharIndex);//finds the final string 'A' for example

    return `${secondChar}${secondChar}`;//Adds/ concats the same value in order to get a form of AA,BB,CC..

  }
}
//createSeat, as implied, creates the seat based on its character of reserved/booked or not yet. 
function createSeat(rowCharacter, seatNumber, cumulativeSeatIndex, isReserved) {//RowCharacter=A,B,C..; cumulativeSeatIndex= 1,2,3..., 
  const seat = document.createElement("div");//creates a place on the html for each seat 
  seat.classList.add("seat");//gets the styles from the css to be applied on made seat 
  seat.id = `${rowCharacter}${cumulativeSeatIndex}`; //making seat.id, in form of A1, A2, A3.. (cumulatively) instead of being similar to the seatingData

  if (isReserved) {
    seat.classList.add("reserved");//gets class from styles.css if the seat belongs in reserved seats 
    seat.addEventListener("mouseover",()=> showTooltip(seat, rowCharacter, cumulativeSeatIndex));//details to be added in tooltip when hovering over, and will not be able to click
  } else {
    seat.addEventListener("click", () => selectSeat(seat));//allowing the seat to be clicked and calling selectSeat function
    seat.addEventListener("mouseover", () => showTooltip(seat, rowCharacter, cumulativeSeatIndex)); // to show tooltip with details upon hovering over
   // seat.addEventListener("mouseout", () => hideTooltip());//tool tip disappears upon moving away from seat 
  }

  const seatNumberText = document.createElement("span");//to create a space on the seat for text
  seatNumberText.textContent = cumulativeSeatIndex; //adds the text on the span with the correct cumulative number 
  seat.appendChild(seatNumberText);//adds seatNumberText onto the created seat. 

  return seat;
}
//creates the auditorium with respect to the seating data 
function initializeAuditorium(rowsData) {
  const auditorium = document.getElementById('auditorium');

  rowsData.forEach((rowData, rowIndex) => {
    const rowCharacter = convertToCharacter(rowIndex); //calling function to convert rowindex to character 

    const rowElement = document.createElement("div");//creating a division for row 
    rowElement.classList.add("row");//adding row style from styles.css

    const rowCharacterElement = document.createElement("div");//creating a div right niext to row in order to add the row charcter (A,B,C..)
    rowCharacterElement.classList.add("row-character-text");//adds row-character-text style from the css 
    rowCharacterElement.textContent = rowCharacter;//div will contain the rowcharacter

    // Append the row character element to the row element
    rowElement.appendChild(rowCharacterElement);

    let cumulativeSeatCount = 0;

    rowData.seats.forEach((numSeats, dataIndex) => {//numseats=total number of seats ,dataindex= index of the row in integer 
      for (let seatIndex = 1; seatIndex <= numSeats; seatIndex++) {//to get seat numbers 
        const isReserved = rowData.reservedSeats && rowData.reservedSeats.includes(cumulativeSeatCount + seatIndex);//forms reserved seats 
        const seat = createSeat(rowCharacter, seatIndex, cumulativeSeatCount + seatIndex, isReserved);//forms normal seats 
        if (dataIndex !== 0) {//at a certain interval
          const spaceElement = document.createElement("div");//creating a div to form a division according to hallplan 
          spaceElement.classList.add("space");//adding space style to div 
          rowElement.appendChild(spaceElement);//appends this element to row 
        }

        if (rowIndex === 15) {
          seat.style.marginRight="-1px";//alignment of the seats 
          rowElement.style.marginLeft = "-100px";  //alignment of row , moving it -100px to the left 
        }

        if (rowIndex===20){
          rowElement.style.marginRight = "-120px";//alignment of row ,moving it -120px to the right 
        }

        rowElement.appendChild(seat);//appneding seat to row
      }
      cumulativeSeatCount += numSeats;

      if (rowCharacter === 'AA' && dataIndex === rowData.seats.length - 1) {//when dataindex= number of seats-1
        const customTextElement = document.createElement("div");
        customTextElement.classList.add("custom-text");//adding cutsom-text to made div
        customTextElement.textContent = "Balcony";//adding text 
        customTextElement.style.marginLeft="0px";//alignment 
        auditorium.appendChild(customTextElement);//appending made element to the auditorium 

      }
      const isLastData = dataIndex === rowData.seats.length - 1;
      if (!isLastData && rowIndex !== 15) { 
        const extraSpaceElement = document.createElement("div");
        extraSpaceElement.classList.add("extra-space");
        rowElement.appendChild(extraSpaceElement);//adding extra space according to hallplan 
      }
    });

    auditorium.appendChild(rowElement);//apending rowelement to auditorium 

    if (rowIndex === 8 || rowIndex === 14 || rowIndex === 20) {
      const bigSpaceElement = document.createElement("div");
      bigSpaceElement.classList.add("big-space");
      auditorium.appendChild(bigSpaceElement);//adding space at the given rowindexes 
    }
  });
}

initializeAuditorium(seatingData);
//making the auditorium with respect to the seating data 
let selectedSeats = []; 

let tooltip;
//adding a tooltip to the page 
function showTooltip(seat, rowCharacter, cumulativeSeatIndex) { 
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    document.body.appendChild(tooltip);;//appending tooltip to the html page 
  }
  //tooltip which ahow details with respect to the seat upon which the mouse is hovering on. It shows the row character, and its index 

  tooltip.innerHTML = `Row: ${rowCharacter}, Seat: ${cumulativeSeatIndex}`; 
  tooltip.style.top = `${seat.offsetTop + 30}px`;
  tooltip.style.left = `${seat.offsetLeft + 5}px`;
  tooltip.style.display = "block";//displays in block 

  //if (isReserved) {
  //tooltip.textContent = "Reserved"; => figure out the tooltip "status part"
  //}
}

function hideTooltip() {//remove tooltip 
  if (tooltip) {
    tooltip.style.display = "none";
  }
}

let selectedSeatIds = []; 
//array for all the seats that have been selected 
function selectSeat(seat) {
  const seatId = seat.id;  //getting the id of the seat for easy organization 

  if (seat.classList.contains("reserved")) { 
  } else {
     //selection and deselection of seats 
    if (seat.classList.contains("selected")) {//if the class of the seat is related to the "selected" style in the css
      seat.classList.remove("selected");//upon deselection, remove it 
      selectedSeats = selectedSeats.filter((selectedSeat) => selectedSeat !== seat);//remove seat from array 
      selectedSeatIds = selectedSeatIds.filter((id) => id !== seatId); // Remove seat ID from the array
      updateSelectedSeatsInfo();//calls function 
    } else {
      if (selectedSeats.length < blocked.maxseats) {//if the number of seats in the array is less than the amount thats been allowed to be chosen 
        seat.classList.add("selected");
        selectedSeats.push(seat); //pushes seat number into selectedSeats array.
        selectedSeatIds.push(seatId); // Add seat ID to the selectedSeatsIds array.
        updateSelectedSeatsInfo();
      } else {//making the integer value to string, to concat overall in alert 
        const s="You can only select up to ";
        const q=blocked.maxseats.toString();
        const w=" seats.";
        const t=s.concat(q,w)
        alert(t);
      }
    }
  }
}
//taking the seats from array, adding and removing them according to the user's choice 
function updateSelectedSeatsInfo() {
  const selectedSeatsInfo = selectedSeatIds.map((seatId) => {
    const rowCharacter = seatId.substring(0, 1); // Get the first character as row character
    const seatNumber = seatId.substring(1); // Get the remaining characters as seat number
    return `${rowCharacter}${seatNumber}`;
  });

  if (selectedSeatsInfo.length > 0) {
    document.getElementById("selected-seats-info").textContent = "Selected Seats: " + selectedSeatsInfo.join(", ");;//if there are seats,show text 
  } else {
    document.getElementById("selected-seats-info").textContent = "No Seat Selected";//if no seats are selected 
  }
}

//taking the deata from the hidden form on the html 
function updateSelectedSeatsInput() {
  const selectedSeatsInput = document.getElementById("selected-seats-input");
  selectedSeatsInput.value = JSON.stringify(selectedSeatIds.join(","));
}

// passing the seats back
const selectedSeatsForm = document.getElementById("selected-seats-form");
selectedSeatsForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent default form submission
  if (selectedSeatIds.length > 0) {
    updateSelectedSeatsInput(); // Update the hidden input field
    selectedSeatsForm.submit(); // Submit the form
    BookedSeats();//adds "booked" seats to reserved seats
    } else {
    alert("Please select at least one seat.");
  }
});