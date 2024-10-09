//refer to script.js for similar code snippets 
var block = document.getElementById("blocked-data");//getting blocked from the hidden form.
var blocked = JSON.parse(block.value);//im using the json as its a dict, and this is what works best according to what I have learnt
console.log(blocked)//to see all the blocked seats in console, just in case 

//similar to script.js 
const seatingData = [
  { seats: [5, 7, 5], reservedSeats: blocked.RA, BlockedSeats:blocked.A }, //A
  { seats: [5, 7, 5], reservedSeats: blocked.RB, BlockedSeats:blocked.B}, //B
  { seats: [5, 8, 5], reservedSeats: blocked.RC, BlockedSeats:blocked.C }, //C
  { seats: [5, 9, 5], reservedSeats: blocked.RD, BlockedSeats:blocked.D }, //D
  { seats: [5, 9, 5], reservedSeats: blocked.RE, BlockedSeats:blocked.E }, //E
  { seats: [6, 10, 6], reservedSeats: blocked.RF, BlockedSeats:blocked.F }, //F
  { seats: [5, 11, 5], reservedSeats: blocked.RG, BlockedSeats:blocked.G }, //G
  { seats: [6, 11, 6], reservedSeats: blocked.RH, BlockedSeats:blocked.H }, //H
  { seats: [6, 12, 6], reservedSeats: blocked.RI, BlockedSeats:blocked.I }, //I
  { seats: [7, 12, 7], reservedSeats: blocked.RJ, BlockedSeats:blocked.J }, //J
  { seats: [7, 12, 7], reservedSeats: blocked.RK, BlockedSeats:blocked.K }, //K
  { seats: [7, 13, 7], reservedSeats: blocked.RL, BlockedSeats:blocked.L }, //L
  { seats: [7, 14, 7], reservedSeats: blocked.RM, BlockedSeats:blocked.M }, //M
  { seats: [6, 15, 6], reservedSeats: blocked.RN, BlockedSeats:blocked.N }, //N
  { seats: [31], reservedSeats: blocked.RO, BlockedSeats:blocked.O }, //O
  { seats: [0, 12, 0], reservedSeats: blocked.RAA , BlockedSeats:blocked.AA}, //AA
  { seats: [4, 12, 6], reservedSeats: blocked.RBB, BlockedSeats:blocked.BB }, //BB
  { seats: [6, 12, 7], reservedSeats: blocked.RCC, BlockedSeats:blocked.CC }, //CC
  { seats: [6, 12, 6], reservedSeats: blocked.RDD, BlockedSeats:blocked.DD }, //DD
  { seats: [6, 12, 6], reservedSeats: blocked.REE, BlockedSeats:blocked.EE }, //EE
  { seats: [18, 0, 6], reservedSeats: blocked.RFF, BlockedSeats:blocked.FF }, //FF
];
//similar to script.js 
function convertToCharacter(rowIndex) {
    if (rowIndex <= 14) {
      return String.fromCharCode(65 + rowIndex); // A-Z
    } else { //AA,BB,CC etc
      const rangeStart = 15
      const rangeEnd = 40
  
      const secondCharIndex = (rowIndex - rangeStart) % 26;
  
      const secondChar = String.fromCharCode(65 + secondCharIndex);
  
      return `${secondChar}${secondChar}`;
  
    }
  }
//similar to script.js 
  function createSeat(rowCharacter, seatNumber, cumulativeSeatIndex, isReserved, isBlocked) {
    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.id = `${rowCharacter}${cumulativeSeatIndex}`;
  
    if (isReserved && !isBlocked) {
      seat.classList.add("reserved");
      seat.addEventListener("click", () => selectSeat(seat));//allowing reserved and blocke/booked seats to be clickable
    }
  
    if (isBlocked) {
      seat.classList.add("booked");
    }
  
    const seatNumberText = document.createElement("span");
    seatNumberText.textContent = cumulativeSeatIndex;
    seat.appendChild(seatNumberText);
  
    return seat;
  }
//similar to script.js 
function initializeAuditorium(rowsData) {
    const auditorium = document.getElementById('auditorium');
  
    rowsData.forEach((rowData, rowIndex) => {
      const rowCharacter = convertToCharacter(rowIndex); // convertin row number to character value
  
      const rowElement = document.createElement("div");
      rowElement.classList.add("row");
  
      const rowCharacterElement = document.createElement("div");
      rowCharacterElement.classList.add("row-character-text");
      rowCharacterElement.textContent = rowCharacter;
  
      // Append the row character element to the row element
      rowElement.appendChild(rowCharacterElement);
  
      let cumulativeSeatCount = 0;
  
      rowData.seats.forEach((numSeats, dataIndex) => {
          for (let seatIndex = 1; seatIndex <= numSeats; seatIndex++) {
            //determining reserved seats and blocked seats and creating seat accordingly 
            const isReserved = !rowData.BlockedSeats || rowData.BlockedSeats.includes(cumulativeSeatCount + seatIndex);
            const isBlocked= !rowData.reservedSeats || !rowData.reservedSeats.includes(cumulativeSeatCount + seatIndex);
            const seat = createSeat(rowCharacter, seatIndex, cumulativeSeatCount + seatIndex,isReserved,isBlocked);
  
          if (dataIndex !== 0) {
            const spaceElement = document.createElement("div");
            spaceElement.classList.add("space");
            rowElement.appendChild(spaceElement);
          }
  
          if (rowIndex === 15) {
            seat.style.marginRight="-1px";
            rowElement.style.marginLeft = "-100px"; 
          }
  
          if (rowIndex===20){
            rowElement.style.marginRight = "-120px";
          }
  
          rowElement.appendChild(seat);
        }
        cumulativeSeatCount += numSeats;
  
        if (rowCharacter === 'AA' && dataIndex === rowData.seats.length - 1) {
          const customTextElement = document.createElement("div");
          customTextElement.classList.add("custom-text");
          customTextElement.textContent = "Balcony";
          customTextElement.style.marginLeft="0px";
          auditorium.appendChild(customTextElement);
  
        }
        const isLastData = dataIndex === rowData.seats.length - 1;
        if (!isLastData && rowIndex !== 15) { 
          const extraSpaceElement = document.createElement("div");
          extraSpaceElement.classList.add("extra-space");
          rowElement.appendChild(extraSpaceElement);
        }
      });
  
      auditorium.appendChild(rowElement);
  
      if (rowIndex === 8 || rowIndex === 14 || rowIndex === 20) {
        const bigSpaceElement = document.createElement("div");
        bigSpaceElement.classList.add("big-space");
        auditorium.appendChild(bigSpaceElement);
      }
    });
  }

initializeAuditorium(seatingData);

let selectedSeats = []; 

let selectedSeatIds = []; 

let currentSelectedSeat = null;

function selectSeat(seat) {
  const seatId = seat.id;

  if (currentSelectedSeat === null) {
    // No seat is currently selected, so add the current seat to the selection
    seat.classList.add("selected");
    currentSelectedSeat = seat;
    selectedSeats.push(seat);
    selectedSeatIds.push(seatId);
    updateSelectedSeatsInfo();
  } else if (currentSelectedSeat === seat) {
    
    seat.classList.remove("selected");
    currentSelectedSeat = null;
    selectedSeats = selectedSeats.filter((selectedSeat) => selectedSeat !== seat);
    selectedSeatIds = selectedSeatIds.filter((id) => id !== seatId);
    updateSelectedSeatsInfo();
  } else {
    const isSelected = selectedSeats.includes(seat);
    if (isSelected) {
      // The current seat is already selected, so deselect it
      seat.classList.remove("selected");
      selectedSeats = selectedSeats.filter((selectedSeat) => selectedSeat !== seat);
      selectedSeatIds = selectedSeatIds.filter((id) => id !== seatId);
    } else {
      // The current seat is not in the selection, so add it
      seat.classList.add("selected");
      selectedSeats.push(seat);
      selectedSeatIds.push(seatId);
    }

    currentSelectedSeat = seat;
    updateSelectedSeatsInfo();
  }
}
//similar to script.js 
function updateSelectedSeatsInfo() {
    const selectedSeatsInfo = selectedSeatIds.map((seatId) => {
    const rowCharacter = seatId.substring(0, 1); // getting the first character as row character
    const seatNumber = seatId.substring(1); // getting the remaining characters as seat number
    return `${rowCharacter}${seatNumber}`;
    });
      
    if (selectedSeatsInfo.length > 0) {
        document.getElementById("selected-seats-info").textContent = "Selected Seats: " + selectedSeatsInfo.join(", ");
    } else {
        document.getElementById("selected-seats-info").textContent = "No Seat Selected";
        }
    }
    //taking input of the reversed/booked seats selected to be cancelled
    function updateSelectedSeatsInput() {
    const selectedSeatsInput = document.getElementById("selected-seats-input");
    selectedSeatsInput.value = JSON.stringify(selectedSeatIds.join(","));//stringing the JSON data
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
  
