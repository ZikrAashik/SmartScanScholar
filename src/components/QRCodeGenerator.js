import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
const QRCodeGenerator = ({ lectureDetails }) => {
  const [qrCode, setQrCode] = useState('');
  useEffect(() => {
    QRCode.toDataURL(lectureDetails).then(setQrCode);
  }, [lectureDetails]);
  return <img src={qrCode} alt="QR Code" />;
};
export default QRCodeGenerator;
