//audi for admin purposes like seeing certain data
//refer script.js for similar/same code explanation. 
var block = document.getElementById("blocked-data");//getting blocked from the hidden form.
var blocked = JSON.parse(block.value);//im using the json as its a dict, and this is what works best according to what I have learnt

//similar to the original script, however with the addition of scannedSeats, BlockedSeats, which is only visible to the admin, from the database. 
const seatingData = [
  { seats: [5, 7, 5], reservedSeats: blocked.A , scannedSeats: blocked.SA, BlockedSeats:blocked.RA}, //A
  { seats: [5, 7, 5], reservedSeats: blocked.B, scannedSeats: blocked.SB,BlockedSeats:blocked.RB}, //B
  { seats: [5, 8, 5], reservedSeats: blocked.C , scannedSeats: blocked.SC,BlockedSeats:blocked.RC}, //C
  { seats: [5, 9, 5], reservedSeats: blocked.D , scannedSeats: blocked.SD,BlockedSeats:blocked.RD}, //D
  { seats: [5, 9, 5], reservedSeats: blocked.E , scannedSeats: blocked.SE,BlockedSeats:blocked.RE}, //E
  { seats: [6, 10, 6], reservedSeats: blocked.F , scannedSeats: blocked.SF,BlockedSeats:blocked.RF}, //F
  { seats: [5, 11, 5], reservedSeats: blocked.G , scannedSeats: blocked.SG,BlockedSeats:blocked.RG}, //G
  { seats: [6, 11, 6], reservedSeats: blocked.H , scannedSeats: blocked.SH,BlockedSeats:blocked.RH}, //H
  { seats: [6, 12, 6], reservedSeats: blocked.I , scannedSeats: blocked.SI,BlockedSeats:blocked.RI}, //I
  { seats: [7, 12, 7], reservedSeats: blocked.J , scannedSeats: blocked.SJ,BlockedSeats:blocked.RJ}, //J
  { seats: [7, 12, 7], reservedSeats: blocked.K , scannedSeats: blocked.SK,BlockedSeats:blocked.RK}, //K
  { seats: [7, 13, 7], reservedSeats: blocked.L , scannedSeats: blocked.SL,BlockedSeats:blocked.RL}, //L
  { seats: [7, 14, 7], reservedSeats: blocked.M , scannedSeats: blocked.SM,BlockedSeats:blocked.RM}, //M
  { seats: [6, 15, 6], reservedSeats: blocked.N , scannedSeats: blocked.SN,BlockedSeats:blocked.RN}, //N
  { seats: [31], reservedSeats: blocked.O , scannedSeats: blocked.SO,BlockedSeats:blocked.RO}, //O
  { seats: [0, 12, 0], reservedSeats: blocked.AA , scannedSeats: blocked.SAA,BlockedSeats:blocked.RAA}, //AA
  { seats: [4, 12, 6], reservedSeats: blocked.BB , scannedSeats: blocked.SBB,BlockedSeats:blocked.RBB}, //BB
  { seats: [6, 12, 7], reservedSeats: blocked.CC , scannedSeats: blocked.SCC,BlockedSeats:blocked.RCC}, //CC
  { seats: [6, 12, 6], reservedSeats: blocked.DD , scannedSeats: blocked.SDD,BlockedSeats:blocked.RDD}, //DD
  { seats: [6, 12, 6], reservedSeats: blocked.EE , scannedSeats: blocked.SEE,BlockedSeats:blocked.REE}, //EE
  { seats: [18, 0, 6], reservedSeats: blocked.FF , scannedSeats: blocked.SFF,BlockedSeats:blocked.RFF} //FF
];
//same as original script
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
//similar to original script 
function createSeat(rowCharacter, seatNumber, cumulativeSeatIndex, isBooked, isScanned,isReserved) {
  const seat = document.createElement("div");
  seat.classList.add("seat");
  seat.id = `${rowCharacter}${cumulativeSeatIndex}`; 

  seat.addEventListener("click", () => selectSeat(seat));//allowing all seats to be clickable 


  if (isBooked) {
    seat.classList.add("booked");//adds booked style from css  
  }
  if(!isScanned){
    seat.classList.add("scanned");//adds scanned style from css  
  }
  if (isReserved){
    seat.classList.add("reserved");//adds booked style from css  
  }

  const seatNumberText = document.createElement("span");
  seatNumberText.textContent = cumulativeSeatIndex;
  seat.appendChild(seatNumberText);

  return seat;
}
//similar to original script
function initializeAuditorium(rowsData) {
  const auditorium = document.getElementById('auditorium');

  rowsData.forEach((rowData, rowIndex) => {
    const rowCharacter = convertToCharacter(rowIndex); // Convert row number to character value

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
          // Determine if the seat is reserved or not based on the reversed logic
          const isBooked = !rowData.reservedSeats || !rowData.reservedSeats.includes(cumulativeSeatCount + seatIndex);//checks for reserved seats and gets a value 
          const isScanned = !rowData.scannedSeats || !rowData.scannedSeats.includes(cumulativeSeatCount + seatIndex);//checks for scanned seats and gets a value 
          const isReserved = !rowData.BlockedSeats || rowData.BlockedSeats.includes(cumulativeSeatCount + seatIndex);//checks for booked seats and gets a value 
          const seat = createSeat(rowCharacter, seatIndex, cumulativeSeatCount + seatIndex, isBooked, isScanned,isReserved);

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

    if (rowIndex === 8 || rowIndex === 14 ) {
      const bigSpaceElement = document.createElement("div");
      bigSpaceElement.classList.add("big-space");
      auditorium.appendChild(bigSpaceElement);
    }else if(rowIndex === 20){
      const bigSpaceElement = document.createElement("div");
      bigSpaceElement.classList.add("spacee");
      auditorium.appendChild(bigSpaceElement);
    }
  });
}

initializeAuditorium(seatingData);

let selectedSeats = []; 

let selectedSeatIds = []; 

let currentSelectedSeat = null;
//similar to original code. 
function selectSeat(seat) {
  const seatId = seat.id; 

    if(currentSelectedSeat=== null){
      seat.classList.add("selected");
      currentSelectedSeat = seat;
      updateSelectedSeatsInfo();
    } else if (currentSelectedSeat === seat) {
      seat.classList.remove("selected");
      currentSelectedSeat = null;
      selectedSeats = selectedSeats.filter((selectedSeat) => selectedSeat !== seat);
      selectedSeatIds = selectedSeatIds.filter((id) => id !== seatId); // Remove seat ID from the array
      updateSelectedSeatsInfo();
    } else {
        currentSelectedSeat.classList.remove("selected");
        seat.classList.add("selected");
        currentSelectedSeat = seat;
        selectedSeats.push(seat); 
        selectedSeatIds.push(seatId); 
        updateSelectedSeatsInfo();
      
    }
  }
  
  function updateSelectedSeatsInfo(isReserved) {
    if (currentSelectedSeat !== null) {
      const seatId = currentSelectedSeat.id;
  
      var deets = document.getElementById("blocked-deets");//getting the details from the database with regard to the seat chosen 
      var details = JSON.parse(deets.value);//parsing those values into JSON data 
  
      const seatDetails = details[seatId];
        if (seatDetails) {
          var selectedSeatsText = "<strong>Seat Details:</strong><br><br>";//adding line on to the html file 
      
          // parsing seatDetails into a json data
          try {
            const parsedDetails = JSON.parse(seatDetails);
      
            // interating through the parsedDetails and add each key-value pair to the table
            selectedSeatsText += "<div style='max-height: 200px; overflow: auto;'><table border='1'>";//making of a table with details, in html
            for (const key in parsedDetails) {
              if (parsedDetails[key] !== null) {//checking if there's any details 
                selectedSeatsText += `<tr><td><strong>${key}</strong></td><td>${parsedDetails[key]}</td></tr>`;//adding each row 
              }
            }
            selectedSeatsText += "</table></div>";
      
            // setting the innerHTML and showing the details in the table 
            document.getElementById("selected-seats-info").innerHTML = selectedSeatsText;
          } catch (error) {
            console.error("Error parsing seat details:", error);
          }
        } else if (isReserved) {//for reserved seats 
          document.getElementById("selected-seats-info").textContent = "Blocked by school (Not booked by anybody.)";
        } else {//for empty seats 
          document.getElementById("selected-seats-info").textContent = "Not booked by anybody."
        }
      }
    }      
  
  