"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Ticket.module.css";

export default function TicketEditor() {
  const [busNumber, setBusNumber] = useState("");
  const [busRoute, setBusRoute] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [numTickets, setNumTickets] = useState("1");
  const [actualFare, setActualFare] = useState("10");
  const [startStop, setStartStop] = useState("");
  const [endStop, setEndStop] = useState("");
  const [ticketColor, setTicketColor] = useState("blue"); // New state for color
  const [showPreview, setShowPreview] = useState(true);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const ticketImages = {
    blue: "/assets/images/sample-ticket-blue.jpg",
    navy: "/assets/images/sample-ticket-navy-blue.jpg",
    orange: "/assets/images/sample-ticket-orange.jpg",
    green: "/assets/images/sample-ticket-green.jpg",
  };

  const getFormattedDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString("en-US", { month: "short" });
    const year = today.getFullYear().toString().slice(-2);
    return `${day} ${month}, ${year}`;
  };

  const getFormattedTime = () => {
    const today = new Date();
    const hours = today.getHours();
    const minutes = today.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Load ticket image whenever color changes
  useEffect(() => {
    const img = new Image();
    img.src = ticketImages[ticketColor];
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [ticketColor]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;
    if (!img) return;


    const fareNum = Number(actualFare);
    const ticketsNum = Number(numTickets) || 1;

    // Apply discount and addition
    const discountedFare = fareNum * 0.9; // 10% discount
    const finalFarePerTicket = discountedFare + 0.25;

    // Calculate total fare
    const totalOriginalFare = fareNum * ticketsNum; 
    const totalFare = finalFarePerTicket * ticketsNum;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    if (numTickets) {
      ctx.font = "500 54px 'Arial', sans-serif";
      ctx.fillText(numTickets, 955, 985);
    }

    ctx.font = "52px 'Source Sans 3', sans-serif";

    if (busNumber) ctx.fillText(busNumber.toUpperCase(), 85, 640);
    if (busRoute) ctx.fillText(busRoute.toUpperCase(), 90, 830);
    if (bookingDate) ctx.fillText(bookingDate, 90, 990);
    if (bookingTime) ctx.fillText(bookingTime, 385, 990);
    if (startStop) ctx.fillText(`${startStop}`, 90, 1150);
    if (endStop) ctx.fillText(`${endStop}`, 90, 1310);

    ctx.font = "bold 54px 'Arial', sans-serif";
    ctx.fillText(`${totalOriginalFare.toFixed(1)}`, 880, 825);

    // Draw final fare (with discount and addition)
    ctx.font = "500 52px 'Arial', sans-serif";
    if (ticketsNum > 1) {
      ctx.fillText(
        `${totalFare.toFixed(2)}`,
        880,
        631
      );
    } else {
      ctx.fillText(`${finalFarePerTicket.toFixed(2)}`, 882, 632);
    }
  };

  useEffect(() => {
    setBookingDate(getFormattedDate());
    setBookingTime(getFormattedTime());
    drawCanvas();
  }, [busNumber, busRoute, startStop, endStop, numTickets, actualFare]);

  const downloadImage = () => {
    setBookingDate(getFormattedDate());
    setBookingTime(getFormattedTime());
    drawCanvas();
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "updated-ticket.jpg";
    link.href = canvas.toDataURL("image/jpeg", 1.0);
    link.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Book Bus Ticket </h1>

        {/* Row with Bus Number and Bus Route */}
        <div className={styles.rowInputs}>
          <div className={styles.formGroup}>
            <label>Bus Number:</label>
            <input
              type="text"
              value={busNumber}
              placeholder="eg. DL51EV3198"
              onChange={(e) => setBusNumber(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Bus Route Number:</label>
            <input
              type="text"
              value={busRoute}
              placeholder="eg. 448"
              onChange={(e) => setBusRoute(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Number of Tickets:</label>
            <input
              type="number"
              min="1"
              value={numTickets}
              placeholder="e.g. 2"
              onChange={(e) => setNumTickets(e.target.value)}
            />
          </div>
          
        </div>

        {/* Row with start, end, and color */}
        <div className={styles.rowInputs}>
          {/* Starting Stop */}
          <div className={styles.formGroup}>
            <label>Starting Stop:</label>
            <input
              list="startStops"
              value={startStop}
              onChange={(e) => setStartStop(e.target.value)}
              placeholder="Select or type stop"
            />
            <datalist id="startStops">
              <option value="Punjabi Bagh Club" />
              <option value="ESI Hospital" />
              <option value="Rajdhani College Raja Garden" />
              <option value="Raja Garden (Ring Road)" />
              <option value="Rajouri Garden Market" />
              <option value="Mayapuri Depot Crossing" />
              <option value="Naraina Vihar" />
              <option value="Maya Puri Crossing (Ring Road)" />
              <option value="Payal Cinema" />
            </datalist>
          </div>

          {/* Ending Stop */}
          <div className={styles.formGroup}>
            <label>Ending Stop:</label>
            <input
              list="endStops"
              value={endStop}
              onChange={(e) => setEndStop(e.target.value)}
              placeholder="Select or type stop"
            />
            <datalist id="endStops">
              <option value="Punjabi Bagh Club" />
              <option value="ESI Hospital" />
              <option value="Rajdhani College Raja Garden" />
              <option value="Raja Garden (Ring Road)" />
              <option value="Rajouri Garden Market" />
              <option value="Mayapuri Depot Crossing" />
              <option value="Naraina Vihar" />
              <option value="Maya Puri Crossing (Ring Road)" />
              <option value="Payal Cinema" />
            </datalist>
          </div>

          <div className={styles.formGroup}>
            <label>Actual Fare (₹ per ticket):</label>
            <select value={actualFare} onChange={(e) => setActualFare(e.target.value)}>
              <option value="10">₹10</option>
              <option value="15">₹15</option>
              <option value="20">₹20</option>
              <option value="25">₹25</option>
            </select>
          </div>
        </div>

        {/* Color Selector */}
        <div className={styles.colorOptionsContainer}>
          <label>Ticket Color:</label>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* Color buttons */}
            <div className={styles.colorOptions}>
              <button
                style={{ backgroundColor: "blue" }}
                onClick={() => setTicketColor("blue")}
              />
              <button
                style={{ backgroundColor: "navy" }}
                onClick={() => setTicketColor("navy")}
              />
              <button
                style={{ backgroundColor: "orange" }}
                onClick={() => setTicketColor("orange")}
              />
              <button
                style={{ backgroundColor: "green" }}
                onClick={() => setTicketColor("green")}
              />
            </div>

            {/* Preview Toggle Switch */}
            <div className={styles.toggleSwitch}>
              <span style={{ fontSize: "14px" }}>Preview</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={showPreview}
                  onChange={() => setShowPreview(!showPreview)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <button className={styles.downloadBtn} onClick={downloadImage}>
          Download Ticket
        </button>
        <div
          className={styles.preview}
          style={{ display: showPreview ? "block" : "none" }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

// "use client";
// import { useState, useRef, useEffect } from "react";
// import styles from "./Ticket.module.css";

// export default function TicketEditor() {
//   const [busNumber, setBusNumber] = useState("");
//   const [busRoute, setBusRoute] = useState("");
//   const [bookingDate, setBookingDate] = useState("");
//   const [bookingTime, setBookingTime] = useState("");
//   const [startStop, setStartStop] = useState("");
//   const [endStop, setEndStop] = useState("");
//   const canvasRef = useRef(null);
//   const imageRef = useRef(null);

//   // Format date like "26 Sep, 25"
//   const getFormattedDate = () => {
//     const today = new Date();
//     const day = today.getDate();
//     const month = today.toLocaleString("en-US", { month: "short" });
//     const year = today.getFullYear().toString().slice(-2);
//     return `${day} ${month}, ${year}`;
//   };

//    const getFormattedTime = () => {
//     const today = new Date();
//     const hours = today.getHours();
//     const minutes = today.getMinutes().toString().padStart(2, "0");
//     const ampm = hours >= 12 ? "PM" : "AM";
//     const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
//     return `${formattedHours}:${minutes} ${ampm}`;
//    };

//   // Load base ticket image
//   useEffect(() => {
//     const img = new Image();
//     img.src = "/assets/images/sample-ticket-blue.jpg"; // make sure image is inside /public
//     img.onload = () => {
//       imageRef.current = img;
//       setBookingDate(getFormattedDate());
//       setBookingTime(getFormattedTime());
//       drawCanvas();
//     };
//   }, []);

//   const drawCanvas = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const img = imageRef.current;

//     if (!img) return;

//     canvas.width = img.width;
//     canvas.height = img.height;

//     // Draw base ticket image
//     ctx.drawImage(img, 0, 0);

//     ctx.font = "52px 'Source Sans 3', sans-serif";
//     ctx.fillStyle = "black";

//     // Bus Number (top-right blank)
//     if (busNumber) ctx.fillText(busNumber.toUpperCase(), 85, 640);

//     // Bus Route Number (under Bus Route)
//     if (busRoute) ctx.fillText(busRoute.toUpperCase(), 90, 830);

//     // Booking Time (under Booking Time)
//     if (bookingDate) ctx.fillText(bookingDate, 90, 990);

//     // Booking Time (on a new line below date)
//     if (bookingTime) ctx.fillText(bookingTime, 385, 990);

//     if (startStop) ctx.fillText(`${startStop}`, 90, 1150);

//     if (endStop) ctx.fillText(`${endStop}`, 90, 1310);
//   };

//   useEffect(() => {
//     setBookingDate(getFormattedDate()); // update date on state changes too
//     setBookingTime(getFormattedTime()); // update date on state changes too
//     drawCanvas();
//   }, [busNumber, busRoute, startStop, endStop]);

//   const downloadImage = () => {
//     setBookingDate(getFormattedDate());
//     setBookingTime(getFormattedTime());
//     drawCanvas();
//     const canvas = canvasRef.current;
//     const link = document.createElement("a");
//     link.download = "updated-ticket.jpg";
//     link.href = canvas.toDataURL("image/jpeg", 1.0);
//     link.click();
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.card}>
//         <h1 className={styles.title}>Book Ticket - Route 1</h1>

//         <div className={styles.formGroup}>
//           <label>Bus Number:</label>
//           <input
//             type="text"
//             value={busNumber}
//             placeholder="eg. DL51EV3198"
//             onChange={(e) => setBusNumber(e.target.value)}
//             required
//           />
//         </div>

//         <div className={styles.formGroup}>
//           <label>Bus Route Number:</label>
//           <input
//             type="text"
//             value={busRoute}
//             placeholder="eg. 448"
//             onChange={(e) => setBusRoute(e.target.value)}
//           />
//         </div>

//         {/* Starting Stop */}
//         <div className={styles.formGroup}>
//             <label>Starting Stop:</label>
//             <input
//                 list="startStops"
//                 value={startStop}
//                 onChange={(e) => setStartStop(e.target.value)}
//                 placeholder="Select or type stop"
//             />
//             <datalist id="startStops">
//                 <option value="Naraina Vihar" />
//                 <option value="Payal Cinema" />
//                 <option value="Punjabi Bagh Club" />
//                 <option value="Rajdhani College Raja Garden" />
//                 <option value="Rajouri Garden Market" />
//                 <option value="Maya Puri Crossing (Ring Road)" />
//                 <option value="Mayapuri Depot Crossing" />
//             </datalist>
//         </div>

//         {/* Ending Stop */}
//         <div className={styles.formGroup}>
//             <label>Ending Stop:</label>
//             <input
//                 list="endStops"
//                 value={endStop}
//                 onChange={(e) => setEndStop(e.target.value)}
//                 placeholder="Select or type stop"
//             />
//             <datalist id="endStops">
//                 <option value="Naraina Vihar" />
//                 <option value="Payal Cinema" />
//                 <option value="Punjabi Bagh Club" />
//                 <option value="Rajdhani College Raja Garden" />
//                 <option value="Rajouri Garden Market" />
//                 <option value="Maya Puri Crossing (Ring Road)" />
//                 <option value="Mayapuri Depot Crossing" />
//             </datalist>
//         </div>

//         <button className={styles.downloadBtn} onClick={downloadImage}>
//           Download Ticket
//         </button>

//         <div className={styles.preview}>
//           <canvas ref={canvasRef} />
//         </div>
//       </div>
//     </div>
//   );
// }
