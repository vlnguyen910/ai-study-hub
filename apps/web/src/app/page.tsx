"use client";

import {
  ArrowRight,
  BrainCircuit,
  Bot,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Layers,
  Mail,
  Menu,
  MessageCircle,
  Play,
  Route,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactElement } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { GuestRoute } from "@/routes/GuestRoute";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
];

const socialProofItems = [
  "FPT University",
  "AI Learning Lab",
  "Student Hub",
  "EduTech Network",
];

const featureItems = [
  {
    icon: BrainCircuit,
    title: "Trợ lý học tập AI",
    description:
      "Placeholder text: gợi ý nội dung trọng tâm và cách ôn tập phù hợp với từng tài liệu.",
  },
  {
    icon: ClipboardList,
    title: "Quiz tự động",
    description:
      "Placeholder text: tạo bộ câu hỏi luyện tập nhanh từ ghi chú, slide hoặc tài liệu upload.",
  },
  {
    icon: Layers,
    title: "Flashcard thông minh",
    description:
      "Placeholder text: chuyển kiến thức thành thẻ ghi nhớ ngắn gọn, dễ ôn lại trước kỳ thi.",
  },
  {
    icon: Route,
    title: "Lộ trình cá nhân hóa",
    description:
      "Placeholder text: theo dõi tiến độ và đề xuất bước học tiếp theo dựa trên mục tiêu của bạn.",
  },
];

const workSteps = [
  {
    title: "Tải tài liệu lên",
    description:
      "Placeholder text: thêm PDF, slide hoặc ghi chú để AI bắt đầu phân tích nội dung.",
  },
  {
    title: "AI xử lý nội dung",
    description:
      "Placeholder text: hệ thống tóm tắt ý chính, nhận diện khái niệm và tạo học liệu.",
  },
  {
    title: "Ôn tập theo kế hoạch",
    description:
      "Placeholder text: học với quiz, flashcard và checklist được sắp xếp theo tiến độ.",
  },
];

const testimonials = [
  {
    name: "Minh Anh",
    role: "Sinh viên Công nghệ thông tin",
    quote:
      "Placeholder text: AI Study Hub giúp mình biến slide dài thành checklist ôn tập rõ ràng hơn.",
    initials: "MA",
  },
  {
    name: "Quốc Bảo",
    role: "Trưởng nhóm học tập",
    quote:
      "Placeholder text: nhóm của mình dùng quiz tự động để rà soát kiến thức trước mỗi buổi học.",
    initials: "QB",
  },
  {
    name: "Linh Chi",
    role: "Sinh viên năm cuối",
    quote:
      "Placeholder text: phần flashcard và gợi ý ôn tập giúp mình tiết kiệm thời gian chuẩn bị thi.",
    initials: "LC",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "0đ",
    description: "Placeholder text cho người mới bắt đầu học với AI.",
    features: [
      "Tạo quiz giới hạn mỗi tháng",
      "Tóm tắt tài liệu cơ bản",
      "Lưu flashcard cá nhân",
      "Truy cập cộng đồng học tập",
    ],
    cta: "Bắt đầu miễn phí",
    href: "/register",
    featured: false,
  },
  {
    name: "Pro",
    price: "Placeholder",
    description: "Placeholder text cho sinh viên cần học tập chuyên sâu hơn.",
    features: [
      "Tạo quiz và flashcard nâng cao",
      "Lộ trình học cá nhân hóa",
      "Phân tích nhiều tài liệu hơn",
      "Ưu tiên tính năng AI mới",
    ],
    cta: "Nâng cấp Pro",
    href: "/register",
    featured: true,
  },
];

const faqItems = [
  {
    question: "AI Study Hub phù hợp với ai?",
    answer:
      "Placeholder text: nền tảng hướng tới sinh viên, nhóm học tập và người cần tổ chức tài liệu học hiệu quả hơn.",
  },
  {
    question: "Tôi có thể tải loại tài liệu nào?",
    answer:
      "Placeholder text: nội dung thật sẽ mô tả các định dạng được hỗ trợ như PDF, slide, ghi chú hoặc tài liệu văn bản.",
  },
  {
    question: "Gói Free có đủ để dùng thử không?",
    answer:
      "Placeholder text: gói Free được thiết kế để người dùng trải nghiệm các tính năng cốt lõi trước khi nâng cấp.",
  },
  {
    question: "Dữ liệu học tập của tôi có an toàn không?",
    answer:
      "Placeholder text: phần này sẽ bổ sung thông tin bảo mật, quyền riêng tư và cách hệ thống xử lý tài liệu.",
  },
  {
    question: "Tôi có thể dùng AI Study Hub cho học nhóm không?",
    answer:
      "Placeholder text: nội dung thật có thể giải thích các tính năng chia sẻ, cộng tác hoặc thư viện nhóm.",
  },
];

const footerGroups = [
  {
    title: "Sản phẩm",
    links: ["Features", "Pricing", "Demo", "FAQ"],
  },
  {
    title: "Công ty",
    links: ["Blog", "Về chúng tôi", "Tuyển dụng", "Điều khoản"],
  },
  {
    title: "Liên hệ",
    links: ["support@aistudyhub.app", "Ho Chi Minh City", "Help Center"],
  },
];

export default function Home(): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <GuestRoute>
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur-xl">
          <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
            <Link
              href="/"
              aria-label="AI Study Hub home"
              className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
            >
              <Logo />
            </Link>

            <nav aria-label="Primary navigation" className="hidden md:flex">
              <ul className="flex items-center gap-8">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <ThemeToggle />
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-primary transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
              >
                Bắt đầu miễn phí
              </Link>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                type="button"
                aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((current) => !current)}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
              >
                {isMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>

          {isMenuOpen ? (
            <div className="border-t border-outline-variant bg-surface px-4 py-4 shadow-xl md:hidden">
              <nav aria-label="Mobile navigation">
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex rounded-xl px-3 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-4 grid gap-3 border-t border-outline-variant pt-4">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant text-sm font-semibold text-primary transition-colors hover:bg-surface-container"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                >
                  Bắt đầu miễn phí
                </Link>
              </div>
            </div>
          ) : null}
        </header>

        <main>
          <section className="relative isolate">
            <div className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-10 lg:py-20">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <Sparkles className="size-4" />
                  AI Study Hub
                </div>

                <h1 className="max-w-4xl text-4xl font-bold leading-tight text-on-surface sm:text-5xl lg:text-6xl">
                  Học tập thông minh hơn với không gian AI dành riêng cho bạn
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-on-surface-variant sm:text-lg">
                  Placeholder text: AI Study Hub giúp sinh viên biến tài liệu
                  học tập thành ghi chú, quiz và lộ trình ôn tập rõ ràng trong
                  vài phút. Nội dung này có thể thay đổi sau theo thông điệp
                  chính thức.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
                  >
                    Bắt đầu miễn phí
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="#demo"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-6 text-sm font-bold text-on-surface transition hover:bg-surface-container focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
                  >
                    <Play className="size-4" />
                    Xem demo
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 text-sm font-medium text-on-surface-variant sm:grid-cols-3">
                  {[
                    "Tạo quiz tự động",
                    "Tóm tắt tài liệu",
                    "Theo dõi tiến độ",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div id="demo" className="relative scroll-mt-24">
                <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 shadow-2xl shadow-primary/10">
                  <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
                    <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-error" />
                        <span className="size-3 rounded-full bg-tertiary" />
                        <span className="size-3 rounded-full bg-primary" />
                      </div>
                      <div className="h-2 w-28 rounded-full bg-outline-variant" />
                    </div>

                    <div className="grid gap-4 p-4 sm:p-5">
                      <div className="rounded-xl bg-primary p-5 text-primary-foreground">
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold opacity-85">
                              Study session
                            </p>
                            <h2 className="mt-1 text-2xl font-bold">
                              AI phân tích tài liệu
                            </h2>
                          </div>
                          <Bot className="size-10 shrink-0" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            ["24", "flashcards"],
                            ["12", "quiz"],
                            ["86%", "ready"],
                          ].map(([value, label]) => (
                            <div
                              key={label}
                              className="rounded-xl bg-primary-foreground/15 px-4 py-3"
                            >
                              <p className="text-xl font-bold">{value}</p>
                              <p className="text-xs font-medium opacity-85">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                              <FileText className="size-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-on-surface">
                                Chapter 04.pdf
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                Đang xử lý
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 rounded-full bg-primary" />
                            <div className="h-2 w-4/5 rounded-full bg-outline-variant" />
                            <div className="h-2 w-2/3 rounded-full bg-outline-variant" />
                          </div>
                        </div>

                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                          <p className="text-sm font-bold text-on-surface">
                            Gợi ý ôn tập hôm nay
                          </p>
                          <div className="mt-4 space-y-3">
                            {[
                              "Ôn 8 khái niệm trọng tâm",
                              "Làm quiz 10 câu",
                              "Lưu ghi chú quan trọng",
                            ].map((item) => (
                              <div
                                key={item}
                                className="flex items-center gap-3 rounded-lg bg-surface-container-low px-3 py-2"
                              >
                                <CheckCircle2 className="size-4 text-primary" />
                                <span className="text-sm font-medium text-on-surface-variant">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="social-proof-heading"
            className="border-y border-outline-variant bg-surface-container-low"
          >
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-10">
              <div>
                <p
                  id="social-proof-heading"
                  className="text-sm font-bold uppercase text-primary"
                >
                  Social proof
                </p>
                <p className="mt-2 text-2xl font-bold text-on-surface sm:text-3xl">
                  10,000+ sinh viên đang sử dụng AI Study Hub
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {socialProofItems.map((item) => (
                  <div
                    key={item}
                    className="flex min-h-20 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-center text-sm font-bold text-on-surface-variant shadow-sm"
                  >
                    <GraduationCap className="mr-2 size-5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="scroll-mt-24 bg-background">
            <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase text-primary">
                  Features
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
                  Những công cụ cốt lõi cho trải nghiệm học tập với AI
                </h2>
                <p className="mt-4 text-base leading-7 text-on-surface-variant">
                  Placeholder text: các tính năng dưới đây sẽ được điều chỉnh
                  theo nội dung thật của sản phẩm ở bước sau.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featureItems.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <article
                      key={feature.title}
                      className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                    >
                      <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-on-surface">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                        {feature.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low">
            <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-bold uppercase text-primary">
                  How it works
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
                  Bắt đầu học cùng AI chỉ trong 3 bước
                </h2>
                <p className="mt-4 text-base leading-7 text-on-surface-variant">
                  Placeholder text: quy trình đơn giản giúp người dùng chuyển từ
                  tài liệu thô sang kế hoạch ôn tập rõ ràng.
                </p>
              </div>

              <div className="relative mt-12 grid gap-4 md:grid-cols-3">
                <div
                  aria-hidden="true"
                  className="absolute left-0 right-0 top-8 hidden h-px bg-outline-variant md:block"
                />

                {workSteps.map((step, index) => (
                  <article
                    key={step.title}
                    className="relative rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                        {index + 1}
                      </div>
                      <div className="hidden h-px flex-1 bg-outline-variant sm:block md:hidden" />
                    </div>

                    <h3 className="text-lg font-bold text-on-surface">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-background">
            <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-bold uppercase text-primary">
                  Testimonials
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
                  Người học nói gì về AI Study Hub
                </h2>
                <p className="mt-4 text-base leading-7 text-on-surface-variant">
                  Placeholder text: các nhận xét dưới đây dùng để giữ layout,
                  nội dung thật sẽ được thay thế sau.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {testimonials.map((testimonial) => (
                  <article
                    key={testimonial.name}
                    className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {testimonial.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-on-surface-variant">
                      {testimonial.quote}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="pricing"
            className="scroll-mt-24 bg-surface-container-low"
          >
            <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <div>
                  <p className="text-sm font-bold uppercase text-primary">
                    Pricing
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
                    Bắt đầu miễn phí, nâng cấp khi cần nhiều sức mạnh hơn
                  </h2>
                  <p className="mt-4 text-base leading-7 text-on-surface-variant">
                    Placeholder text: bảng giá teaser giúp người dùng hiểu nhanh
                    khác biệt giữa gói Free và Pro.
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-5 inline-flex text-sm font-bold text-primary transition-colors hover:text-primary/80"
                  >
                    Xem chi tiết bảng giá
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {pricingPlans.map((plan) => (
                    <article
                      key={plan.name}
                      className={
                        plan.featured
                          ? "rounded-2xl border border-primary bg-primary p-5 text-primary-foreground shadow-2xl shadow-primary/20"
                          : "rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 text-on-surface shadow-sm"
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <p
                            className={
                              plan.featured
                                ? "mt-2 text-sm leading-6 text-primary-foreground/85"
                                : "mt-2 text-sm leading-6 text-on-surface-variant"
                            }
                          >
                            {plan.description}
                          </p>
                        </div>
                        {plan.featured ? (
                          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold">
                            Popular
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-6">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span
                          className={
                            plan.featured
                              ? "ml-2 text-sm text-primary-foreground/80"
                              : "ml-2 text-sm text-on-surface-variant"
                          }
                        >
                          / tháng
                        </span>
                      </div>

                      <ul className="mt-6 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <CheckCircle2
                              className={
                                plan.featured
                                  ? "mt-0.5 size-4 shrink-0 text-primary-foreground"
                                  : "mt-0.5 size-4 shrink-0 text-primary"
                              }
                            />
                            <span
                              className={
                                plan.featured
                                  ? "text-sm leading-6 text-primary-foreground/90"
                                  : "text-sm leading-6 text-on-surface-variant"
                              }
                            >
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={plan.href}
                        className={
                          plan.featured
                            ? "mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-foreground px-5 text-sm font-bold text-primary transition hover:bg-primary-foreground/90"
                            : "mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl border border-outline-variant px-5 text-sm font-bold text-primary transition hover:bg-surface-container"
                        }
                      >
                        {plan.cta}
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-background">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-20">
              <div>
                <p className="text-sm font-bold uppercase text-primary">FAQ</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
                  Câu hỏi thường gặp
                </h2>
                <p className="mt-4 text-base leading-7 text-on-surface-variant">
                  Placeholder text: giải đáp nhanh các điểm người dùng thường
                  cần biết trước khi bắt đầu.
                </p>
              </div>

              <div className="space-y-3">
                {faqItems.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  const panelId = `faq-panel-${index}`;

                  return (
                    <div
                      key={item.question}
                      className="rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() =>
                          setOpenFaqIndex((current) =>
                            current === index ? -1 : index,
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-bold text-on-surface"
                      >
                        <span>{item.question}</span>
                        <ChevronDown
                          className={
                            isOpen
                              ? "size-5 shrink-0 rotate-180 text-primary transition-transform"
                              : "size-5 shrink-0 text-primary transition-transform"
                          }
                        />
                      </button>
                      {isOpen ? (
                        <div
                          id={panelId}
                          className="border-t border-outline-variant px-5 py-4 text-sm leading-7 text-on-surface-variant"
                        >
                          {item.answer}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low px-4 py-6 sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-2xl bg-primary px-6 py-10 text-primary-foreground shadow-2xl shadow-primary/20 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase text-primary-foreground/80">
                  Ready to study smarter
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                  Biến tài liệu học tập thành kế hoạch ôn tập ngay hôm nay
                </h2>
              </div>
              <Link
                href="/register"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-foreground px-6 text-sm font-bold text-primary transition hover:bg-primary-foreground/90"
              >
                Bắt đầu miễn phí
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-outline-variant bg-surface">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1.5fr] lg:px-10">
            <div>
              <Link
                href="/"
                aria-label="AI Study Hub home"
                className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
              >
                <Logo />
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-7 text-on-surface-variant">
                Placeholder text: AI Study Hub là không gian học tập dùng AI để
                tổ chức tài liệu, tạo quiz và hỗ trợ ôn tập hiệu quả hơn.
              </p>
              <div className="mt-5 flex items-center gap-3">
                {[
                  { label: "Updates", icon: Send },
                  { label: "AI Study Hub", icon: Sparkles },
                  { label: "Email", icon: Mail },
                  { label: "Community", icon: MessageCircle },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href="#"
                      aria-label={item.label}
                      className="grid size-10 place-items-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition hover:border-primary hover:text-primary"
                    >
                      <Icon className="size-5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h2 className="text-sm font-bold text-on-surface">
                    {group.title}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {group.links.map((item) => (
                      <li key={item}>
                        <Link
                          href="#"
                          className="text-sm text-on-surface-variant transition-colors hover:text-primary"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-outline-variant px-4 py-5 sm:px-6 lg:px-10">
            <p className="mx-auto max-w-7xl text-sm text-on-surface-variant">
              © 2026 AI Study Hub. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </GuestRoute>
  );
}
