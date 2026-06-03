import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface Props {
  readonly data: any;
}

export function FileInfoCard({ data }: Props): React.JSX.Element {
  return (
    <Card className="p-5">
      <h3 className="mb-5 text-lg font-semibold">Thông tin tệp</h3>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span>Định dạng</span>

          <Badge>{data.format}</Badge>
        </div>

        <div className="flex justify-between">
          <span>Dung lượng</span>

          <span>{data.size}</span>
        </div>

        <div className="flex justify-between">
          <span>Số trang</span>

          <span>{data.pages}</span>
        </div>

        <div className="flex justify-between">
          <span>Ngôn ngữ</span>

          <span>{data.language}</span>
        </div>
      </div>
    </Card>
  );
}
