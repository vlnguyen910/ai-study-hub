import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM12 12.8L4.08 8.46L12 4.07L19.92 8.46L12 12.8Z" fill="#004ecc"/>
            <path d="M4 14V18H10V14" stroke="#004ecc" strokeWidth="2" />
          </svg>
          <span className={styles.logoText}>AcademiShare</span>
        </div>
        
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${styles.active}`}>Home</Link>
          <Link href="/library" className={styles.navLink}>Library</Link>
          <Link href="/community" className={styles.navLink}>Community</Link>
          <Link href="/upload" className={styles.navLink}>Upload</Link>
        </nav>

        <div className={styles.headerActions}>
          <button className={styles.iconBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </button>
          <button className={styles.iconBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <Link href="/login" className={styles.joinBtn}>Tham gia ngay</Link>
        </div>
      </header>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Kho lưu trữ tài liệu <span className={styles.textBlue}>học thuật hàng đầu</span> cho sinh viên
            </h1>
            <p className={styles.heroDesc}>
              Nền tảng chia sẻ kiến thức toàn diện, nơi bạn có thể tìm kiếm hàng triệu giáo trình, đề thi và bài giảng chất lượng từ cộng đồng sinh viên ưu tú.
            </p>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Tìm kiếm tài liệu, khóa học..." className={styles.searchInput} />
              <button className={styles.searchBtn}>Khám phá</button>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <div className={styles.heroImagePlaceholder}></div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tính năng cốt lõi</h2>
            <p className={styles.sectionSubtitle}>Trải nghiệm học tập không giới hạn với hệ sinh thái công cụ hiện đại</p>
          </div>

          <div className={styles.featureCards}>
            <div className={styles.cardWhite}>
              <div className={styles.iconWrapperBlue}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <h3 className={styles.cardTitle}>Thư viện tài liệu đa dạng</h3>
              <p className={styles.cardDesc}>Hơn 1,000,000+ tài liệu được phân loại theo từng chuyên ngành và trường đại học.</p>
              <div className={styles.cardImageBottom}></div>
            </div>

            <div className={styles.cardBlue}>
              <div className={styles.iconWrapperWhite}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004ecc" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <h3 className={styles.cardTitleWhite}>Đóng góp & Chia sẻ</h3>
              <p className={styles.cardDescWhite}>Tải lên tài liệu của bạn chỉ với một cú kéo thả và nhận điểm thưởng từ cộng đồng.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
