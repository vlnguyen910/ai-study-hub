"use client";

import { createDocument, getDocuments, type DocumentDto } from "@/API";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactElement } from "react";

type DocumentItem = {
  id: string;
  title: string;
  author: string;
  pages: number;
  views: string;
  rating: number;
  type: "PDF" | "DOCX";
  image: string;
  subject: string;
  university: string;
  category: string;
};

type FilterOption = {
  value: string;
  label: string;
};

type FilterDropdownProps = {
  title: string;
  placeholder: string;
  options: FilterOption[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  multiSelect: boolean;
  selectedValues: string[];
  onToggleValue: (value: string) => void;
};

const SUBJECT_OPTIONS: FilterOption[] = [
  { value: "Giải tích 1", label: "Giải tích 1" },
  { value: "Giải tích 2", label: "Giải tích 2" },
  { value: "Đại số tuyến tính", label: "Đại số tuyến tính" },
  { value: "Xác suất thống kê", label: "Xác suất thống kê" },
];

const UNIVERSITY_OPTIONS: FilterOption[] = [
  { value: "ĐH Bách Khoa", label: "ĐH Bách Khoa" },
  { value: "ĐH Khoa học Tự nhiên", label: "ĐH Khoa học Tự nhiên" },
  { value: "ĐH Kinh tế Quốc dân", label: "ĐH Kinh tế Quốc dân" },
  { value: "ĐH Công Nghệ", label: "ĐH Công Nghệ" },
  { value: "ĐH Sư phạm", label: "ĐH Sư phạm" },
  { value: "ĐH Quốc Gia", label: "ĐH Quốc Gia" },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: "Đề thi & Đáp án", label: "Đề thi & Đáp án" },
  { value: "Giáo trình", label: "Giáo trình" },
  { value: "Bài tập lớn", label: "Bài tập lớn" },
];

function FilterDropdown({
  title,
  placeholder,
  options,
  searchValue,
  onSearchChange,
  isOpen,
  onToggleOpen,
  multiSelect,
  selectedValues,
  onToggleValue,
}: FilterDropdownProps) {
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  const summaryLabel =
    selectedLabels.length > 0
      ? `${selectedLabels[0]}${selectedLabels.length > 1 ? ` +${selectedLabels.length - 1}` : ""}`
      : title;
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <div className="relative pb-4 border-b border-gray-200">
      <button
        type="button"
        className="w-full flex items-center justify-between py-3 px-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
      >
        <span className="flex flex-col items-start gap-1">
          <span className="text-xs font-semibold text-gray-600 uppercase">
            {title}
          </span>
          <strong className="text-sm text-gray-900">{summaryLabel}</strong>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-2">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-500"
              placeholder={placeholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-blue-50 transition-colors text-left ${
                      isSelected ? "bg-blue-50 text-blue-600" : "text-gray-900"
                    }`}
                    onClick={() => onToggleValue(option.value)}
                  >
                    <span className="w-4 flex items-center justify-center font-bold text-sm">
                      {multiSelect
                        ? isSelected
                          ? "✓"
                          : ""
                        : isSelected
                          ? "●"
                          : ""}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Không tìm thấy kết quả phù hợp
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function mapApiDocument(document: DocumentDto, index: number): DocumentItem {
  const format = String(document.format ?? "PDF").toUpperCase();

  return {
    id: document.id || `api-${index}`,
    title: document.title,
    author: document.authorId
      ? `${document.authorId} • AI Study Hub`
      : "Unknown author",
    pages: Math.max(1, Math.floor((document.sizeInBytes ?? 100_000) / 80_000)),
    views: "0",
    rating: 4.5,
    type: format === "DOCX" ? "DOCX" : "PDF",
    image:
      "https://images.unsplash.com/photo-1633613286848-e6f43bbafb84?w=500&q=80",
    subject: document.subjectId ?? "General",
    university: "AI Study Hub",
    category: document.status ?? "General",
  };
}

export default function LibraryPage(): ReactElement {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFilter, setOpenFilter] = useState<
    "subject" | "university" | "type" | null
  >(null);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [universitySearch, setUniversitySearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDocuments = async () => {
      try {
        const response = await getDocuments({ page: 1, limit: 30 });

        if (isMounted) {
          setDocuments(
            response.map((item, index) => mapApiDocument(item, index)),
          );
          setLoadError(false);
        }
      } catch {
        if (isMounted) {
          setDocuments([]);
          setLoadError(true);
        }
      }
    };

    fetchDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          document.title,
          document.author,
          document.subject,
          document.university,
          document.category,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesSubject =
        selectedSubjects.length === 0 ||
        selectedSubjects.includes(document.subject);
      const matchesUniversity =
        !selectedUniversity || document.university === selectedUniversity;
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(document.category);

      return matchesQuery && matchesSubject && matchesUniversity && matchesType;
    });
  }, [
    documents,
    searchQuery,
    selectedSubjects,
    selectedTypes,
    selectedUniversity,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedSubjects.length > 0 ||
    Boolean(selectedUniversity) ||
    selectedTypes.length > 0;

  const pageTitle = hasActiveFilters ? "Kết quả tìm kiếm" : "Thư viện";
  const pageSubtitle = hasActiveFilters
    ? `Tìm thấy ${filteredDocuments.length} tài liệu phù hợp`
    : loadError
      ? "Không load được tài liệu"
      : `Khám phá ${documents.length} tài liệu học thuật được chọn lọc từ cộng đồng`;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSubjects([]);
    setSelectedUniversity("");
    setSelectedTypes([]);
    setSubjectSearch("");
    setUniversitySearch("");
    setTypeSearch("");
    setOpenFilter(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-1 overflow-hidden bg-white">
        <aside className="w-64 border-r border-gray-200 overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Thư viện</h2>
            <p className="text-sm text-gray-600">
              Chế độ khách - chưa đăng nhập
            </p>
          </div>

          <div className="mx-4 my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Bạn đang xem thư viện ở chế độ khách.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Đăng nhập để lưu tài liệu, theo dõi khóa học và đóng góp nội dung.
            </p>
            <Link
              href="/login"
              className="block text-center w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>

          <div className="px-6 py-4">
            <div className="text-sm font-bold text-gray-900 mb-4">Bộ lọc</div>

            <FilterDropdown
              title="Môn học"
              placeholder="Tìm môn học"
              options={SUBJECT_OPTIONS}
              searchValue={subjectSearch}
              onSearchChange={setSubjectSearch}
              isOpen={openFilter === "subject"}
              onToggleOpen={() =>
                setOpenFilter(openFilter === "subject" ? null : "subject")
              }
              multiSelect
              selectedValues={selectedSubjects}
              onToggleValue={(value) =>
                setSelectedSubjects((current) =>
                  current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value],
                )
              }
            />

            <FilterDropdown
              title="Trường đại học"
              placeholder="Tìm trường"
              options={UNIVERSITY_OPTIONS}
              searchValue={universitySearch}
              onSearchChange={setUniversitySearch}
              isOpen={openFilter === "university"}
              onToggleOpen={() =>
                setOpenFilter(openFilter === "university" ? null : "university")
              }
              multiSelect={false}
              selectedValues={selectedUniversity ? [selectedUniversity] : []}
              onToggleValue={(value) =>
                setSelectedUniversity((current) =>
                  current === value ? "" : value,
                )
              }
            />

            <FilterDropdown
              title="Loại tài liệu"
              placeholder="Tìm loại tài liệu"
              options={TYPE_OPTIONS}
              searchValue={typeSearch}
              onSearchChange={setTypeSearch}
              isOpen={openFilter === "type"}
              onToggleOpen={() =>
                setOpenFilter(openFilter === "type" ? null : "type")
              }
              multiSelect
              selectedValues={selectedTypes}
              onToggleValue={(value) =>
                setSelectedTypes((current) =>
                  current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value],
                )
              }
            />

            <button
              type="button"
              className="w-full mt-4 py-2 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium"
              onClick={resetFilters}
            >
              Làm mới bộ lọc
            </button>
          </div>

          <div className="px-6 py-4">
            <button
              type="button"
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
              onClick={async () => {
                try {
                  const created = await createDocument({
                    title: "Uploaded from Library",
                    description: "Created from library upload button",
                    fileUrl: "https://example.com/docs/uploaded.pdf",
                    publicId: `library-${Date.now()}`,
                    sizeInBytes: 512000,
                    format: "pdf",
                    resourceType: "document",
                    subjectId: "subject-001",
                    isPublic: true,
                  });

                  setDocuments((current) => [
                    mapApiDocument(created, current.length),
                    ...current,
                  ]);
                } catch {
                  // Keep UI stable when upload endpoint is unavailable.
                }
              }}
            >
              Upload Document
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {pageTitle}
              </h1>
              <p className="text-gray-600">{pageSubtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Sắp xếp: <strong>Mới nhất</strong>
              </span>
              <button
                type="button"
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                type="button"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {loadError ? (
            <div className="mx-8 mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Không load được tài liệu. Vui lòng thử lại sau.
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div
                    className="w-full h-40 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${doc.image})` }}
                  >
                    <span
                      className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-bold text-white ${
                        doc.type === "PDF" ? "bg-red-600" : "bg-blue-600"
                      }`}
                    >
                      {doc.type}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
                      <span className="text-xs text-gray-600">
                        {doc.author}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          {doc.pages}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {doc.views}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 font-bold">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {doc.rating}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                &lt;
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded font-semibold"
              >
                1
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                2
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                3
              </button>
              <span className="px-2 text-gray-600">...</span>
              <button
                type="button"
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                12
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
