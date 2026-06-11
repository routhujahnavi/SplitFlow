"use client";

import { QRCodeSVG } from "qrcode.react";

export function ProfileQRCode({ value }: { value: string }) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm inline-block">
      <QRCodeSVG
        value={value}
        size={140}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"Q"}
        includeMargin={false}
      />
    </div>
  );
}
