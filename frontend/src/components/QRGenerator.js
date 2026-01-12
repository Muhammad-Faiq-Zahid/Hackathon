import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRGenerator = ({ location }) => {
  if (!location) return null;

  const qrData = JSON.stringify({
    type: "nav-location",
    qrCode: location.qrCode,
    name: location.name,
    timestamp: new Date().toISOString(),
  });

  const handleDownload = () => {
    const canvas = document.getElementById(`qr-${location.qrCode}`);
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `nav-qr-${location.qrCode}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="qr-generator">
      <h3>📱 QR Code for This Location</h3>
      <div className="qr-display">
        <QRCodeCanvas
          id={`qr-${location.qrCode}`}
          value={qrData}
          size={180}
          level="H"
          includeMargin={true}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
        <div className="qr-info">
          <h4>{location.name}</h4>
          <p>
            <strong>QR Code:</strong> {location.qrCode}
          </p>
          <p>
            <strong>Category:</strong> {location.category}
          </p>
        </div>
      </div>
      <button onClick={handleDownload} className="download-btn">
        ⬇️ Download QR Code
      </button>
      <p className="qr-note">
        <small>
          Print and place this QR code at the location. Visitors can scan it to
          start navigation.
        </small>
      </p>
    </div>
  );
};

export default QRGenerator;
