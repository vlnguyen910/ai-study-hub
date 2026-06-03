"use client";

import type { FC } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import { uploadMock } from "@/mockdata/uploadMock";

export const FileUploadBox: FC = () => {
  const { handleUpload, error, config } = useFileUpload();

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* Upload Area */}
      <label
        className="
          flex
          min-h-[320px]
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-2xl
          border-2
          border-dashed
          border-slate-300
          bg-white
          px-6
          py-10
          text-center
          transition-all
          duration-200
          hover:border-[#2563EB]
          hover:bg-blue-50/30
        "
      >
        <input
          type="file"
          className="hidden"
          multiple
          accept={config.allowedExtensions.join(",")}
          onChange={handleUpload}
        />

        {/* Upload Icon */}
        <span
          className="
            material-symbols-outlined
            mb-5
            text-6xl
            text-[#2563EB]
          "
        >
          upload_file
        </span>

        {/* Title */}
        <h2
          className="
            text-xl
            font-semibold
            text-black
          "
        >
          {uploadMock.title}
        </h2>

        {/* Subtitle */}
        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          {uploadMock.subtitle}
        </p>

        {/* Supported Files */}
        <div
          className="
            mt-6
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
          "
        >
          {uploadMock.supportedFormats.map((format) => (
            <span
              key={format}
              className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-slate-700
                "
            >
              {format}
            </span>
          ))}
        </div>
      </label>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {/* Academic Integrity Warning */}
      <div
        className="
          flex
          gap-4
          rounded-2xl
          border
          border-blue-200
          bg-[#93C5FD]
          p-5
        "
      >
        {/* Icon */}
        <div className="shrink-0">
          <span
            className="
              material-symbols-outlined
              text-3xl
              text-[#2563EB]
            "
          >
            verified_user
          </span>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3
            className="
              font-semibold
              text-[#2563EB]
            "
          >
            {uploadMock.integrityRule.title}
          </h3>

          <p
            className="
              text-sm
              leading-6
              text-[#1E3A8A]
            "
          >
            {uploadMock.integrityRule.content}
          </p>
        </div>
      </div>
    </div>
  );
};
