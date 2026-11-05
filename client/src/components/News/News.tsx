import { useLang } from "../../hooks/useLang";
import styles from "./News.module.scss";
import NewsCard from "../NewsCard/NewsCard";
import { useGetNewsQuery } from "../../api/api";

function News() {
  const { t, lang } = useLang();
  const { data: news = [] } = useGetNewsQuery();
  return (
    <section className={styles.wrapper}>
      <div className="container">
        <div className={styles.center}>
          <h2 className={styles.title}>{t[lang].news.title}</h2>
        </div>
        <div className={styles.row}>
          {news.slice(0, 3).map((el) => (
            <NewsCard id={el.id} text={el.title} date={new Date(el.created_at).toLocaleDateString()} img={el.image_url || ""} key={el.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default News;
