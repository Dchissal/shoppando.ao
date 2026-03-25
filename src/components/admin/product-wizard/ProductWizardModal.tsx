import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../../firebase';
import { Product } from '../../../types/index';

// Tipos temporários para resolver problema de cache do TypeScript
type ProductType = 'simple' | 'variable';

interface ProductAttribute {
  type: 'color' | 'size' | 'capacity';
  values: string[];
}

interface ProductVariant {
  id: string;
  sku: string;
  attributes: Partial<Record<'color' | 'size' | 'capacity', string>>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageURL?: string;
  isDefault?: boolean;
  isActive: boolean;
}

interface ProductMedia {
  id: string;
  type: 'image' | 'video' | 'external';
  url: string;
  thumbnailURL?: string;
  alt?: string;
  sortOrder: number;
}

interface ProductVideo {
  id: string;
  youtubeUrl: string;
  title?: string;
}

interface ProductSpecification {
  key: string;
  value: string;
  group?: string;
}
import { WizardStepIndicator } from './WizardStepIndicator';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { AttributesStep } from './steps/AttributesStep';
import { VariantsStep } from './steps/VariantsStep';
import { MediaStep } from './steps/MediaStep';
import { SpecsStep } from './steps/SpecsStep';

interface ProductWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
}

// Função auxiliar para gerar ID único
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Função para gerar SKU
function generateSKU(name: string, attributes?: Partial<Record<string, string>>): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);

  if (!attributes || Object.keys(attributes).length === 0) {
    return `${base}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  const attrCodes = Object.values(attributes)
    .map(v => v?.slice(0, 3).toUpperCase())
    .join('-');

  return `${base}-${attrCodes}`;
}

export function ProductWizardModal({
  isOpen,
  onClose,
  editingProduct,
}: ProductWizardModalProps) {
  // Estado do wizard
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estado do formulário
  const [productType, setProductType] = useState<ProductType>('simple');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Produto simples
  const [price, setPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [sku, setSku] = useState('');

  // Produto variável
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Media
  const [coverImage, setCoverImage] = useState<File | string | null>(null);
  const [gallery, setGallery] = useState<ProductMedia[]>([]);
  const [videos, setVideos] = useState<ProductVideo[]>([]);

  // Especificações
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [datasheetFile, setDatasheetFile] = useState<File | string | null>(null);
  const [featured, setFeatured] = useState(false);

  // Carregar dados do produto em edição
  useEffect(() => {
    if (editingProduct) {
      setProductType(editingProduct.type || 'simple');
      setName(editingProduct.name);
      setDescription(editingProduct.description || '');
      setCategory(editingProduct.category);
      setPrice(editingProduct.price);
      setOldPrice(editingProduct.oldPrice || 0);
      setStock(editingProduct.stock);
      setSku(editingProduct.sku || '');
      setAttributes(editingProduct.attributes || []);
      setVariants(editingProduct.variants || []);
      setCoverImage(editingProduct.imageURL);
      setGallery(editingProduct.gallery || []);
      setVideos(editingProduct.videos || []);
      // Converter especificações do formato antigo para o novo
      const convertedSpecifications: ProductSpecification[] = [];
      if (editingProduct.specifications) {
        if (Array.isArray(editingProduct.specifications)) {
          convertedSpecifications.push(...editingProduct.specifications);
        } else {
          // Converter do formato antigo { [key: string]: string }
          Object.entries(editingProduct.specifications).forEach(([key, value]) => {
            convertedSpecifications.push({ key, value });
          });
        }
      }
      setSpecifications(convertedSpecifications);
      setDatasheetFile(editingProduct.datasheetURL || null);
      setFeatured(editingProduct.featured || false);
    }
  }, [editingProduct]);

  // Função para atualizar campos do BasicInfoStep
  const handleBasicInfoUpdate = (field: string, value: any) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'category':
        setCategory(value);
        break;
      case 'productType':
        setProductType(value);
        break;
      case 'price':
        setPrice(value);
        break;
      case 'oldPrice':
        setOldPrice(value);
        break;
      case 'stock':
        setStock(value);
        break;
      case 'sku':
        setSku(value);
        break;
    }
  };
  const resetForm = () => {
    setStep(1);
    setSuccess(false);
    setProductType('simple');
    setName('');
    setDescription('');
    setCategory('');
    setPrice(0);
    setOldPrice(0);
    setStock(0);
    setSku('');
    setAttributes([]);
    setVariants([]);
    setCoverImage(null);
    setGallery([]);
    setVideos([]);
    setSpecifications([]);
    setDatasheetFile(null);
    setFeatured(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // Navegação entre steps
  const maxStep = productType === 'variable' ? 5 : 3;

  const canGoNext = () => {
    if (step === 1) {
      return name && category && (productType === 'simple' ? price > 0 : true);
    }
    if (step === 2 && productType === 'variable') {
      return attributes.length > 0 && attributes.every(a => a.values.length > 0);
    }
    if (step === 3 && productType === 'variable') {
      return variants.length > 0 && variants.some(v => v.isActive);
    }
    return true;
  };

  const handleNext = () => {
    if (step < maxStep && canGoNext()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Upload de ficheiros para Firebase Storage
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Publicar produto
  const handlePublish = async () => {
    if (!canGoNext()) return;

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilizador não autenticado');
      }

      // Upload de imagem de capa
      let coverImageURL = typeof coverImage === 'string' ? coverImage : '';
      if (coverImage instanceof File) {
        coverImageURL = await uploadFile(
          coverImage,
          `products/${Date.now()}_cover_${coverImage.name}`
        );
      }

      // Upload de galeria
      const galleryWithURLs: ProductMedia[] = await Promise.all(
        gallery.map(async (item) => {
          if ((item as any)._file) {
            const url = await uploadFile(
              (item as any)._file,
              `products/${Date.now()}_gallery_${(item as any)._file.name}`
            );
            return { ...item, url };
          }
          return item;
        })
      );

      // Upload de variantes com imagens
      const variantsWithImages: ProductVariant[] = await Promise.all(
        variants.map(async (variant) => {
          if ((variant as any)._imageFile) {
            const imageURL = await uploadFile(
              (variant as any)._imageFile,
              `products/variants/${Date.now()}_${variant.sku}.jpg`
            );
            return { ...variant, imageURL };
          }
          return variant;
        })
      );

      // Upload de datasheet
      let datasheetURL = typeof datasheetFile === 'string' ? datasheetFile : undefined;
      if (datasheetFile instanceof File) {
        datasheetURL = await uploadFile(
          datasheetFile,
          `products/datasheets/${Date.now()}_${datasheetFile.name}`
        );
      }

      // Preparar dados do produto
      const productData: any = {
        name,
        description,
        category,
        type: productType,
        status: editingProduct?.status || 'active',
        featured,
        imageURL: coverImageURL,
        gallery: galleryWithURLs,
        videos,
        specifications,
        datasheetURL,
        updatedAt: serverTimestamp(),
      };

      if (productType === 'simple') {
        productData.price = price;
        productData.oldPrice = oldPrice || null;
        productData.stock = stock;
        productData.sku = sku || generateSKU(name);
      } else {
        productData.attributes = attributes;
        productData.variants = variantsWithImages;
        // Calcular preço base (menor preço) e stock total
        const activeVariants = variantsWithImages.filter(v => v.isActive);
        productData.price = activeVariants.length > 0
          ? Math.min(...activeVariants.map(v => v.price))
          : 0;
        productData.stock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
      }

      if (editingProduct) {
        // Actualizar produto existente
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        // Criar novo produto
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao publicar produto:', error);
      alert('Erro ao publicar produto. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-neutral-500 font-medium text-sm">
                {productType === 'variable' ? 'Produto com variantes' : 'Produto simples'}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Indicator */}
          <WizardStepIndicator
            currentStep={step}
            productType={productType}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 mb-2">
                  {editingProduct ? 'Produto actualizado!' : 'Produto publicado!'}
                </h3>
                <p className="text-neutral-500">
                  A redirecionar...
                </p>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <BasicInfoStep
                  name={name}
                  description={description}
                  category={category}
                  productType={productType}
                  price={price}
                  oldPrice={oldPrice}
                  stock={stock}
                  sku={sku}
                  onUpdate={handleBasicInfoUpdate}
                />
              </motion.div>
            ) : step === 2 && productType === 'variable' ? (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AttributesStep
                  category={category}
                  attributes={attributes}
                  onUpdate={setAttributes}
                />
              </motion.div>
            ) : step === 3 && productType === 'variable' ? (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <VariantsStep
                  productName={name}
                  attributes={attributes}
                  variants={variants}
                  basePrice={price || 0}
                  baseStock={stock || 0}
                  onUpdate={setVariants}
                />
              </motion.div>
            ) : step === (productType === 'variable' ? 4 : 2) ? (
              <motion.div
                key="step-media"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <MediaStep
                  coverImage={coverImage}
                  gallery={gallery}
                  videos={videos}
                  onCoverChange={setCoverImage}
                  onGalleryChange={setGallery}
                  onVideosChange={setVideos}
                />
              </motion.div>
            ) : (
              <motion.div
                key="step-specs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <SpecsStep
                  specifications={specifications}
                  datasheetFile={datasheetFile}
                  featured={featured}
                  onSpecificationsChange={setSpecifications}
                  onDatasheetChange={setDatasheetFile}
                  onFeaturedChange={setFeatured}
                  productName={name}
                  productType={productType}
                  category={category}
                  price={price}
                  stock={stock}
                  variants={variants}
                  coverImage={coverImage}
                  gallery={gallery}
                  videos={videos}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-neutral-100 flex justify-between gap-4 flex-shrink-0">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar
              </button>
            )}

            <div className="flex-1" />

            {step < maxStep ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || loading}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-100"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!canGoNext() || loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {editingProduct ? 'Guardar Alterações' : 'Publicar Produto'}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
