import styles from "./NewsPageContent.module.scss";
import { useLang } from "../../hooks/useLang";
import NewsCard from "../NewsCard/NewsCard";
import SectionTitle from "../SectionTitle/SectionTitle";
import { useGetNewsQuery, useGetSingleNewsQuery } from "../../api/api";
import { mediaUrl } from "../../utils/mediaUrl";
import { useParams } from "react-router-dom";

function NewsPageContent() {
  const { t, lang } = useLang();
  const { id } = useParams();

  const { data: news = [] } = useGetNewsQuery(undefined, { skip: !!id });
  const { data: article } = useGetSingleNewsQuery(Number(id), { skip: !id });
  const [featured, ...items] = news;
  if (id) return (
    <section className={styles.wrapper}>
      <div className="container">
        <SectionTitle>{article?.title || "Новость"}</SectionTitle>
        {article && <article className={styles.main__news}>
          {article.image_url && <div className={styles.image__wrapper}><img src={mediaUrl(article.image_url)} alt={article.title} /></div>}
          <div className={styles.card__content}>
            <p className={styles.card__date}>{new Date(article.created_at).toLocaleDateString()}</p>
            <h3 className={styles.card__title}>{article.title}</h3>
            <p className={styles.card__desc}>{article.content}</p>
          </div>
        </article>}
      </div>
    </section>
  );
  return (
    <section className={styles.wrapper}>
      <div className="container">
        <SectionTitle>{t[lang].news.title}</SectionTitle>
        <p className={styles.text}>Следите за новостями Pro auto</p>
        <div className={styles.main__news}>
          {featured && <>
            <div className={styles.image__wrapper}>{featured.image_url && <img src={mediaUrl(featured.image_url)} alt={featured.title} />}</div>
            <div className={styles.card__content}>
              <p className={styles.card__date}>{new Date(featured.created_at).toLocaleDateString()}</p>
              <h3 className={styles.card__title}>{featured.title}</h3>
              <p className={styles.card__desc}>{featured.content}</p>
            </div>
          </>}
        </div>
        <div className={styles.row}>
          {items.map((el) => (
            <NewsCard key={el.id} id={el.id} text={el.title} date={new Date(el.created_at).toLocaleDateString()} img={el.image_url || ""} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewsPageContent;
