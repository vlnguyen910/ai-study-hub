import { FileUploadBox } from "../components/FileUploadBox";
import { DocumentUploadForm } from "../components/DocumentUploadForm";

export default function UploadPage(): React.JSX.Element {
  return (
    <main
      className="
        mx-auto
        max-w-7xl
        px-6
        py-10
      "
    >
      <div
        className="
          grid
          grid-cols-1
          gap-8
          lg:grid-cols-2
          lg:items-start
        "
      >
        {/* Left Column */}
        <section className="w-full">
          <FileUploadBox />
        </section>

        {/* Right Column */}
        <section className="w-full">
          <DocumentUploadForm />
        </section>
      </div>
    </main>
  );
}
