"use client";
import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import styles from "./Ticket.module.css";

export default function TicketEditor() {
  const [busNumberPrefix, setBusNumberPrefix] = useState("");
  const [busNumberDigits, setBusNumberDigits] = useState("");
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
  const ticketIdRef = useRef(
    `T${Date.now().toString(36)}${Math.random().toString(16).slice(2, 10)}`
      .toUpperCase()
  );

  const ticketImages = {
    blue: "/assets/images/sample-ticket-blue.jpg",
    navy: "/assets/images/sample-ticket-navy-blue.jpg",
    orange: "/assets/images/sample-ticket-orange.jpg",
    purple: "/assets/images/sample-ticket-purple.png",
  };

  const ticketBackgrounds = {
    blue: "#1bbabe",
    navy: "#0003fe",
    orange: "#ff6319",
    purple: "#8f00ff",
  };

  const busNumberPrefixes = ["DL51EV", "DL1PD", "DL51GD"];
  const busNumber = `${busNumberPrefix}${busNumberDigits}`;

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

  const getTicketFilename = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${day}-${month}-${hours}-${minutes}.html`;
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const getTicketPayload = (date, time) =>
    JSON.stringify({
      id: ticketIdRef.current,
      busNumber,
      busRoute,
      bookingDate: date,
      bookingTime: time,
      numTickets,
      actualFare,
      startStop,
      endStop,
    });

  const buildClickableTicketHtml = ({
    ticketImage,
    qrImage,
    date,
    time,
    backgroundColor,
  }) => {
    const title = `Ticket ${ticketIdRef.current}`;

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    html,
    body {
      margin: 0;
      width: 100%;
      height: 100%;
      height: -webkit-fill-available;
      height: 100svh;
      height: 100dvh;
      overflow: hidden;
      overflow: clip;
      position: fixed;
      inset: 0;
      background: ${backgroundColor};
      font-family: Arial, sans-serif;
      overscroll-behavior: none;
      touch-action: manipulation;
    }
    .screen {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      height: -webkit-fill-available;
      height: 100svh;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      background: ${backgroundColor};
      overflow: hidden;
      overflow: clip;
    }
    .qr-toggle {
      position: fixed;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }
    .qr-screen {
      display: none;
    }
    .qr-toggle:checked ~ .qr-screen {
      display: flex;
    }
    .qr-toggle:checked ~ .ticket-screen {
      display: none;
    }
    .topbar {
      height: 76px;
      display: grid;
      grid-template-columns: 44px 1fr auto;
      align-items: center;
      gap: 12px;
      padding: max(0px, env(safe-area-inset-top)) 16px 0;
      color: #f0f0f0;
      font-size: 17px;
      font-weight: 500;
      white-space: nowrap;
    }
    .close-icon {
      border: 0;
      background: transparent;
      color: #f0f0f0;
      font-size: 36px;
      font-weight: 500;
      line-height: 1;
      text-decoration: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .issue {
      justify-self: center;
    }
    .all-tickets {
      font-size: 17px;
    }
    .ticket-wrap {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      overflow: hidden;
      overflow: clip;
    }
    .ticket {
      position: relative;
      width: min(100vw, calc(100dvh * 1080 / 2165));
      height: min(100dvh, calc(100vw * 2165 / 1080));
      max-width: 100vw;
      max-height: 100dvh;
      overflow: hidden;
      overflow: clip;
    }
    .ticket img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .qr-trigger {
      position: absolute;
      left: 8%;
      top: 66.7%;
      width: 84%;
      height: 7.1%;
      border: 0;
      background: transparent;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .qr-wrap {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 24px calc(120px + env(safe-area-inset-bottom));
      overflow: hidden;
    }
    .qr-card {
      width: min(86vw, 420px);
      max-height: calc(100dvh - 220px);
      padding: 14px;
      border-radius: 3px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    }
    .qr-card img {
      display: block;
      width: 100%;
      height: auto;
      max-height: calc(100dvh - 248px);
      object-fit: contain;
    }
  </style>
</head>
<body>
  <input class="qr-toggle" id="qr-toggle" type="checkbox" />

  <section class="screen qr-screen">
    <header class="topbar">
      <label class="close-icon back" for="qr-toggle" aria-label="Back">&times;</label>
      <div class="issue">&#9888;&#65039; Issue with ticket?</div>
      <div class="all-tickets">View all tickets</div>
    </header>
    <main class="qr-wrap">
      <div class="qr-card">
        <img src="${qrImage}" alt="Ticket QR code" />
      </div>
    </main>
  </section>

  <section class="screen ticket-screen">
    <div class="ticket-wrap">
      <main class="ticket">
        <img src="${ticketImage}" alt="Generated bus ticket" />
        <label class="qr-trigger" for="qr-toggle" aria-label="Show QR code"></label>
      </main>
    </div>
  </section>

  <script>
    window.scrollTo(0, 0);
    document.addEventListener("touchmove", function (event) {
      event.preventDefault();
    }, { passive: false });
  </script>
</body>
</html>`;
  };
  const saveClickableTicket = async (html, filename) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
  }, [
    busNumberPrefix,
    busNumberDigits,
    busRoute,
    startStop,
    endStop,
    numTickets,
    actualFare,
  ]);

  const downloadImage = async () => {
    const currentDate = getFormattedDate();
    const currentTime = getFormattedTime();

    setBookingDate(currentDate);
    setBookingTime(currentTime);

    // State updates are asynchronous, so draw once with the latest date/time
    // before exporting the canvas.
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    if (!canvas || !ctx || !img) return;

    drawCanvas();
    ctx.font = "52px 'Source Sans 3', sans-serif";
    ctx.fillText(currentDate, 90, 990);
    ctx.fillText(currentTime, 385, 990);

    const ticketImage = canvas.toDataURL("image/jpeg", 0.95);
    const qrImage = await QRCode.toDataURL(
      getTicketPayload(currentDate, currentTime),
      {
        width: 320,
        margin: 1,
        color: {
          dark: "#111111",
          light: "#ffffff",
        },
      }
    );

    const html = buildClickableTicketHtml({
      ticketImage,
      qrImage,
      date: currentDate,
      time: currentTime,
      backgroundColor: ticketBackgrounds[ticketColor],
    });

    await saveClickableTicket(html, getTicketFilename());
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Book Bus Ticket </h1>

        {/* Row with Bus Number and Bus Route */}
        <div className={styles.rowInputs}>
          <div className={styles.formGroup}>
            <label>Bus Number:</label>
            <div className={styles.busNumberFields}>
              <input
                list="busNumberPrefixes"
                value={busNumberPrefix}
                placeholder="DL51EV"
                onChange={(e) =>
                  setBusNumberPrefix(
                    e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
                  )
                }
              />
              <datalist id="busNumberPrefixes">
                {busNumberPrefixes.map((prefix) => (
                  <option key={prefix} value={prefix}>
                    {prefix}
                  </option>
                ))}
              </datalist>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="4"
                value={busNumberDigits}
                placeholder="3198"
                onChange={(e) =>
                  setBusNumberDigits(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                required
              />
            </div>
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
              <option value="Naraina Vihar" />
              <option value="ESI Hospital" />
              <option value="Rajdhani College Raja Garden" />
              <option value="Raja Garden (Ring Road)" />
              <option value="Rajouri Garden Market" />
              <option value="Mayapuri Depot Crossing" />
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
              <option value="Naraina Vihar" />
              <option value="ESI Hospital" />
              <option value="Rajdhani College Raja Garden" />
              <option value="Raja Garden (Ring Road)" />
              <option value="Rajouri Garden Market" />
              <option value="Mayapuri Depot Crossing" />
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
                style={{ backgroundColor: "purple" }}
                onClick={() => setTicketColor("purple")}
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
        <button type="button" className={styles.downloadBtn} onClick={downloadImage}>
          Download Clickable Ticket
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
