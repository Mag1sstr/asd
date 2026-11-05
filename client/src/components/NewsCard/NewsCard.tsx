import styles from "./NewsCard.module.scss";
import { mediaUrl } from "../../utils/mediaUrl";
import { Link } from "react-router-dom";

interface IProps {
  id: number;
  img: string;
  text: string;
  date: string;
}
function NewsCard({ id, img, text, date }: IProps) {
  return (
    <Link className={styles.card} to={`/info/${id}`}>
      <div className={styles.image__wrapper}>
          {img && <img src={mediaUrl(img)} alt="image" />}
      </div>
      <div className={styles.content}>
        <p className={styles.date}>{date}</p>
        <p className={styles.text}>{text}</p>
        <div className={styles.end}>
          <svg
            width="51"
            height="20"
            viewBox="0 0 51 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M43.6709 11.9991L0 11.9991V7.99912L43.6695 7.99912L38.7583 2.72627L41.6853 0L49.7297 8.63673L50.9993 9.99987L49.7297 11.363L41.6853 19.9997L38.7583 17.2735L43.6709 11.9991Z"
              fill="#C53720"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default NewsCard;
