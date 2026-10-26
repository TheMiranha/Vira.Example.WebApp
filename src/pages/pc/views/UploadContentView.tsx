import { useState } from "react";
import { FileUpload, type FileUploadItem } from "@/components/arc/file-upload/file-upload";
import { Input } from "@/components/arc/input/input";
import { Select } from "@/components/arc/select/select";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import { Button } from "@/components/arc/button/button";
import { Badge } from "@/components/arc/badge/badge";
import { Switch } from "@/components/arc/switch/switch";
import { Check, Sparkles, Plus, Eye } from "lucide-react";
import styles from "./UploadContentView.module.css";

interface ActiveProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  salesCount: number;
  active: boolean;
}

const initialProducts: ActiveProduct[] = [
  {
    id: "prod-1",
    name: "Guia TikTok & Reels 2026 (PDF + Checklist)",
    category: "E-book & PDF Digital",
    price: "R$ 47,00",
    salesCount: 142,
    active: true,
  },
  {
    id: "prod-2",
    name: "Pack de 50 Templates Editáveis Notion",
    category: "Templates & Arquivos",
    price: "R$ 67,00",
    salesCount: 89,
    active: true,
  },
  {
    id: "prod-3",
    name: "Manual Prático de Monetização para Creators",
    category: "E-book & PDF Digital",
    price: "R$ 39,00",
    salesCount: 64,
    active: true,
  },
];

const categoryOptions = [
  { value: "ebook", label: "E-book & PDF Digital" },
  { value: "templates", label: "Templates & Arquivos (Notion / Sheets)" },
  { value: "video", label: "Videoaulas & Mini-Curso" },
  { value: "audio", label: "Áudio & Podcasts Exclusivos" },
];

const deliveryOptions = [
  { value: "instant", label: "Download Imediato" },
  { value: "exclusive-link", label: "Link Exclusivo" },
  { value: "email-wa", label: "E-mail & WhatsApp" },
];

export function UploadContentView() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("ebook");
  const [price, setPrice] = useState("47,00");
  const [delivery, setDelivery] = useState("instant");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeProducts, setActiveProducts] = useState<ActiveProduct[]>(initialProducts);

  // Simulates realistic file upload progress for Arc FileUpload
  const handleUpload = async (_file: File, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => {
    return new Promise<void>((resolve, reject) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        if (options.signal.aborted) {
          clearInterval(interval);
          reject(new Error("Upload cancelado"));
          return;
        }
        currentProgress += 20;
        options.onProgress(Math.min(currentProgress, 100));
        if (currentProgress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 180);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newProduct: ActiveProduct = {
        id: `prod-${Date.now()}`,
        name: productName,
        category: categoryOptions.find(c => c.value === category)?.label ?? "Infoproduto",
        price: `R$ ${price}`,
        salesCount: 0,
        active: true,
      };

      setActiveProducts([newProduct, ...activeProducts]);
      setIsSubmitting(false);
      setSuccess(true);
      setProductName("");
      setDescription("");
      setUploadedFiles([]);

      setTimeout(() => setSuccess(false), 4000);
    }, 800);
  };

  const toggleProduct = (id: string) => {
    setActiveProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Subir Conteúdos Digitais</h2>
          <p>Cadastre novos infoprodutos, defina preços e configure a entrega automática.</p>
        </div>
      </header>

      {success && (
        <div className={styles.successBox}>
          <Check size={20} className={styles.successIcon} />
          <div>
            <strong>Infoproduto publicado com sucesso!</strong>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
              Seu produto já está visível para compra imediata na sua Loja Mobile.
            </p>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {/* Upload Form */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Cadastrar Novo Infoproduto</h3>
              <p>Envie o arquivo final para os compradores receberem após o Pix.</p>
            </div>
            <Sparkles size={18} color="var(--accent)" />
          </div>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <Input
              label="Nome do Infoproduto"
              placeholder="Ex: Guia Prático de Gravação e Roteiros 2026"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />

            <div className={styles.twoCols}>
              <Select
                label="Tipo de Conteúdo"
                options={categoryOptions}
                value={category}
                onValueChange={setCategory}
              />
              <Input
                label="Preço de Venda (R$)"
                placeholder="47,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <span className={styles.fieldLabel}>Método de Entrega aos Compradores</span>
              <SegmentedControl
                options={deliveryOptions}
                value={delivery}
                onValueChange={setDelivery}
              />
            </div>

            <Input
              label="Descrição Curta / Promessa"
              placeholder="Ex: O passo a passo exato para destravar suas gravações..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className={styles.uploadZone}>
              <span className={styles.fieldLabel}>Arquivo Digital do Produto</span>
              <FileUpload
                label="Arraste e solte o arquivo aqui"
                description="Suporta PDF, ZIP, MP4, MP3 até 500 MB"
                accept=".pdf,.zip,.mp4,.mp3,.epub,.notion"
                maxSize={500 * 1024 * 1024}
                value={uploadedFiles}
                onChange={setUploadedFiles}
                onUpload={handleUpload}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={!productName.trim()}
            >
              <Plus size={16} />
              <span>Publicar Infoproduto na Loja</span>
            </Button>
          </form>
        </div>

        {/* Active Products List */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Infoprodutos Ativos</h3>
              <p>{activeProducts.length} produtos disponíveis para compra</p>
            </div>
            <Badge tone="success" size="sm">Loja Ativa</Badge>
          </div>

          <div className={styles.productsList}>
            {activeProducts.map(prod => (
              <div key={prod.id} className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{prod.name}</span>
                  <div className={styles.productMeta}>
                    <span>{prod.category}</span>
                    <span>·</span>
                    <span>{prod.salesCount} vendas</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={styles.productPrice}>{prod.price}</span>
                  <Switch
                    checked={prod.active}
                    onCheckedChange={() => toggleProduct(prod.id)}
                    aria-label={`Ativar ou pausar ${prod.name}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <a href="/mobile" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="md" style={{ width: "100%" }}>
              <Eye size={15} />
              <span>Visualizar na Loja Mobile</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default UploadContentView;
