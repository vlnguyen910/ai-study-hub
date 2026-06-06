import { DocumentUploadForm } from "../components/DocumentUploadForm";
import { Card } from "@/components/ui/Card";

export default function UploadPage(): React.JSX.Element {
  return (
    <div className="min-w-0 bg-background">
      <Card className="p-5 shadow-sm shadow-black/5 lg:p-6">
        <div>
          <div className="mb-6">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Đóng góp tài liệu
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Chia sẻ tài liệu học tập của bạn với cộng đồng!
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            <DocumentUploadForm />
          </div>
        </div>
      </Card>
    </div>
  );
}
