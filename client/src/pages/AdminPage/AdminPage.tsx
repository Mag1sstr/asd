import { useState, type FormEvent } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../hooks/useAuth";
import { useModals } from "../../hooks/useModals";
import {
  useCreateCategoryMutation,
  useCreateNewsMutation,
  useCreateProductMutation,
  useDeleteCategoryMutation,
  useDeleteNewsMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetInquiriesQuery,
  useGetNewsQuery,
  useGetProductsQuery,
  useUpdateCategoryMutation,
  useUpdateNewsMutation,
  useUpdateProductMutation,
  useUploadImageMutation,
} from "../../api/api";
import type { ICategory, IInquiry, INews, IProductData, IProductInput } from "../../types/interfaces";
import { toast } from "react-toastify";
import styles from "./AdminPage.module.scss";

type Tab = "products" | "categories" | "news" | "inquiries";
const emptyProduct: IProductInput = { name: "", price: 0, available: 1, code: "", manufacturer: "", description: "" };
const emptyNews = { title: "", content: "", image_url: "" };

function AdminPage() {
  const { user } = useAuth();
  const { setOpenLoginModal } = useModals();
  const [tab, setTab] = useState<Tab>("products");
  const [productForm, setProductForm] = useState<IProductInput>(emptyProduct);
  const [productEditId, setProductEditId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryEditId, setCategoryEditId] = useState<number | null>(null);
  const [newsForm, setNewsForm] = useState(emptyNews);
  const [newsEditId, setNewsEditId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: productsData } = useGetProductsQuery({ page: 1, size: 100 }, { skip: !user?.isAdmin });
  const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: !user?.isAdmin });
  const { data: news = [] } = useGetNewsQuery(undefined, { skip: !user?.isAdmin });
  const { data: inquiries = [] } = useGetInquiriesQuery(undefined, { skip: !user?.isAdmin });
  const [createProduct, productCreate] = useCreateProductMutation();
  const [updateProduct, productUpdate] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createNews] = useCreateNewsMutation();
  const [updateNews] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();
  const [uploadImage] = useUploadImageMutation();

  const resetProduct = () => { setProductForm(emptyProduct); setProductEditId(null); };
  const submitProduct = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (productEditId) await updateProduct({ id: productEditId, body: productForm }).unwrap();
      else await createProduct(productForm).unwrap();
      toast.success(productEditId ? "Товар обновлён" : "Товар создан");
      resetProduct();
    } catch { toast.error("Не удалось сохранить товар"); }
  };
  const beginProductEdit = (item: IProductData) => {
    setProductEditId(item.id);
    setProductForm({
      ...emptyProduct, name: item.name, price: Number(item.price), available: item.available,
      code: item.code || "", manufacturer: item.manufacturer || "", description: item.description || "",
      categoryId: categories.find((category) => category.name === item.category?.name)?.id,
      imageUrl: item.image_url || undefined,
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const onImageSelected = async (file?: File) => {
    if (!file) return;
    const data = new FormData();
    data.append("image", file);
    setUploading(true);
    try {
      const result = await uploadImage(data).unwrap();
      setProductForm((current) => ({ ...current, imageUrl: result.url }));
      setNewsForm((current) => ({ ...current, image_url: result.url }));
      toast.success("Изображение загружено");
    } catch { toast.error("Не удалось загрузить изображение"); }
    finally { setUploading(false); }
  };

  const submitCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    try {
      if (categoryEditId) await updateCategory({ id: categoryEditId, body: { name: categoryName } }).unwrap();
      else await createCategory({ name: categoryName }).unwrap();
      setCategoryName(""); setCategoryEditId(null); toast.success("Категория сохранена");
    } catch { toast.error("Не удалось сохранить категорию"); }
  };
  const submitNews = async (event: FormEvent) => {
    event.preventDefault();
    if (!newsForm.title.trim()) return;
    try {
      const body = { title: newsForm.title, content: newsForm.content, image_url: newsForm.image_url || null };
      if (newsEditId) await updateNews({ id: newsEditId, body }).unwrap();
      else await createNews(body).unwrap();
      setNewsForm(emptyNews); setNewsEditId(null); toast.success("Новость сохранена");
    } catch { toast.error("Не удалось сохранить новость"); }
  };

  return (
    <>
      <Header slider={false} />
      <main className={styles.page}>
        <div className="container">
          <h1>Панель администратора</h1>
          {!user ? (
            <div className={styles.notice}>Войдите под аккаунтом администратора. <button onClick={() => setOpenLoginModal(true)}>Войти</button></div>
          ) : !user.isAdmin ? (
            <p className={styles.notice}>У текущего аккаунта нет прав администратора.</p>
          ) : (
            <>
              <nav className={styles.tabs}>
                {([["products", "Товары"], ["categories", "Категории"], ["news", "Новости"], ["inquiries", "Заявки"]] as [Tab, string][]).map(([value, label]) =>
                  <button key={value} className={tab === value ? styles.active : ""} onClick={() => setTab(value)}>{label}</button>,
                )}
              </nav>

              {tab === "products" && <section className={styles.section}>
                <h2>{productEditId ? "Редактировать товар" : "Добавить товар"}</h2>
                <form className={styles.form} onSubmit={submitProduct}>
                  <input required placeholder="Название" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                  <input required type="number" min="0" placeholder="Цена" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} />
                  <input placeholder="Артикул" value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} />
                  <input placeholder="Производитель" value={productForm.manufacturer} onChange={(e) => setProductForm({ ...productForm, manufacturer: e.target.value })} />
                  <select value={productForm.categoryId || ""} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value ? Number(e.target.value) : undefined })}>
                    <option value="">Категория</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <select value={productForm.brandId || ""} onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value ? Number(e.target.value) : undefined })}>
                    <option value="">Марка автомобиля</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <select value={productForm.modelId || ""} onChange={(e) => setProductForm({ ...productForm, modelId: e.target.value ? Number(e.target.value) : undefined })}>
                    <option value="">Модель</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <select value={productForm.generationId || ""} onChange={(e) => setProductForm({ ...productForm, generationId: e.target.value ? Number(e.target.value) : undefined })}>
                    <option value="">Поколение</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <select value={productForm.available} onChange={(e) => setProductForm({ ...productForm, available: Number(e.target.value) })}>
                    <option value={1}>В наличии</option><option value={0}>Нет в наличии</option>
                  </select>
                  <textarea placeholder="Описание" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  <label className={styles.upload}>Фото товара<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => void onImageSelected(e.target.files?.[0])} /></label>
                  {productForm.imageUrl && <span className={styles.uploaded}>Изображение прикреплено</span>}
                  <div className={styles.actions}>
                    <button className={styles.primary} disabled={uploading || productCreate.isLoading || productUpdate.isLoading}>{productEditId ? "Сохранить" : "Создать товар"}</button>
                    {productEditId && <button type="button" onClick={resetProduct}>Отмена</button>}
                  </div>
                </form>
                <div className={styles.list}>
                  {productsData?.items.map((item) => <div className={styles.row} key={item.id}>
                    <div><strong>{item.name}</strong><small>{item.code} · {item.price} ₸ · {item.category?.name}</small></div>
                    <div className={styles.actions}><button onClick={() => beginProductEdit(item)}>Изменить</button><button className={styles.danger} onClick={() => void deleteProduct(item.id).unwrap().catch(() => toast.error("Не удалось удалить товар"))}>Удалить</button></div>
                  </div>)}
                </div>
              </section>}

              {tab === "categories" && <section className={styles.section}>
                <h2>{categoryEditId ? "Редактировать категорию" : "Добавить категорию"}</h2>
                <form className={styles.inlineForm} onSubmit={submitCategory}>
                  <input required placeholder="Название категории" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                  <button className={styles.primary}>{categoryEditId ? "Сохранить" : "Добавить"}</button>
                  {categoryEditId && <button type="button" onClick={() => { setCategoryEditId(null); setCategoryName(""); }}>Отмена</button>}
                </form>
                <div className={styles.list}>{categories.map((category: ICategory) => <div className={styles.row} key={category.id}>
                  <div><strong>{category.name}</strong><small>ID: {category.id}</small></div>
                  <div className={styles.actions}><button onClick={() => { setCategoryEditId(category.id); setCategoryName(category.name); }}>Изменить</button><button className={styles.danger} onClick={() => void deleteCategory(category.id).unwrap().catch(() => toast.error("Категория используется товаром"))}>Удалить</button></div>
                </div>)}</div>
              </section>}

              {tab === "news" && <section className={styles.section}>
                <h2>{newsEditId ? "Редактировать новость" : "Добавить новость"}</h2>
                <form className={styles.form} onSubmit={submitNews}>
                  <input required placeholder="Заголовок" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
                  <textarea placeholder="Текст новости" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} />
                  <label className={styles.upload}>Фото новости<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => void onImageSelected(e.target.files?.[0])} /></label>
                  {newsForm.image_url && <span className={styles.uploaded}>Изображение прикреплено</span>}
                  <div className={styles.actions}><button className={styles.primary} disabled={uploading}>{newsEditId ? "Сохранить" : "Создать новость"}</button>{newsEditId && <button type="button" onClick={() => { setNewsEditId(null); setNewsForm(emptyNews); }}>Отмена</button>}</div>
                </form>
                <div className={styles.list}>{news.map((item: INews) => <div className={styles.row} key={item.id}>
                  <div><strong>{item.title}</strong><small>{new Date(item.created_at).toLocaleDateString()}</small></div>
                  <div className={styles.actions}><button onClick={() => { setNewsEditId(item.id); setNewsForm({ title: item.title, content: item.content, image_url: item.image_url || "" }); }}>Изменить</button><button className={styles.danger} onClick={() => void deleteNews(item.id).unwrap().catch(() => toast.error("Не удалось удалить новость"))}>Удалить</button></div>
                </div>)}</div>
              </section>}

              {tab === "inquiries" && <section className={styles.section}>
                <h2>Входящие заявки</h2>
                <div className={styles.list}>{inquiries.map((item: IInquiry) => <article className={styles.inquiry} key={item.id}>
                  <div className={styles.row}><div><strong>{item.name}</strong><small>{item.tel} · {item.email}</small></div><small>{new Date(item.created_at).toLocaleString()}</small></div>
                  <p>{item.message}</p>
                </article>)}</div>
                {!inquiries.length && <p>Заявок пока нет.</p>}
              </section>}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default AdminPage;
