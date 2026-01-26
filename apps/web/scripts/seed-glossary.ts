
import { config } from "dotenv";
import type { glossary } from "../db/schema";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

// Reliable AI-themed generic images
const AI_IMAGES = {
    abstract: "https://images.unsplash.com/photo-1620712943543-bcc4628c6bb3?q=80&w=1000&auto=format&fit=crop",
    brain: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
    chip: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
    code: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    robot: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop",
    network: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=1000&auto=format&fit=crop",
    future: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    security: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
};

const terms = [
    // --- 1. FUNDAMENTALS (ASOSLAR) ---
    {
        term: "Artificial Intelligence",
        slug: "ai",
        definition: "Sun'iy intellekt (AI) - inson aqliy qobiliyatlarini (o'rganish, fikrlash, muammolarni hal qilish) kompyuter tizimlari orqali simulyatsiya qilish sohasidir.",
        category: "Asoslar",
        imageUrl: AI_IMAGES.brain
    },
    {
        term: "Machine Learning",
        slug: "machine-learning",
        definition: "Mashinali o'rganish (ML) - kompyuterlarga aniq dasturlashtirilmasdan ma'lumotlardan o'rganish va qaror qabul qilish imkonini beruvchi AI tarmog'i.",
        category: "Asoslar",
        imageUrl: AI_IMAGES.chip
    },
    {
        term: "Deep Learning",
        slug: "deep-learning",
        definition: "Chuqur o'rganish (DL) - ko'p qatlamli sun'iy neyron tarmoqlaridan foydalanib, murakkab ma'lumotlarni (tasvir, ovoz) tahlil qiluvchi ML yo'nalishi.",
        category: "Asoslar",
        imageUrl: AI_IMAGES.network
    },
    {
        term: "Data Science",
        slug: "data-science",
        definition: "Ma'lumotlar fani - ilmiy usullar, jarayonlar va algoritmlar yordamida tuzilgan va tuzilmagan ma'lumotlardan bilim va xulosalar olish sohasi.",
        category: "Asoslar",
        imageUrl: AI_IMAGES.data
    },
    {
        term: "Algorithm",
        slug: "algorithm",
        definition: "Algoritm - aniq bir muammoni hal qilish uchun bajarilishi kerak bo'lgan ketma-ket ko'rsatmalar to'plami.",
        category: "Asoslar",
        imageUrl: AI_IMAGES.code
    },
    {
        term: "Model",
        slug: "model",
        definition: "Model - ma'lumotlar asosida o'qitilgan algoritmning natijasi. U yangi ma'lumotlarni qabul qilib, bashorat yoki qaror chiqaradi.",
        category: "Asoslar",
        imageUrl: AI_IMAGES.abstract
    },
    { term: "Training", slug: "training", definition: "O'qitish - modelga kirish ma'lumotlari (input) va to'g'ri javoblar o'rtasidagi bog'liqlikni topishni o'rgatish jarayoni.", category: "Asoslar", imageUrl: AI_IMAGES.chip },
    { term: "Testing", slug: "testing", definition: "Sinov - modelning ilgari ko'rmagan ma'lumotlarda qanchalik to'g'ri ishlashini tekshirish jarayoni.", category: "Asoslar", imageUrl: AI_IMAGES.chip },
    { term: "Dataset", slug: "dataset", definition: "Ma'lumotlar to'plami - modelni o'qitish yoki sinash uchun ishlatiladigan tartiblangan ma'lumotlar yig'indisi.", category: "Data", imageUrl: AI_IMAGES.data },
    { term: "Big Data", slug: "big-data", definition: "Katta ma'lumotlar - an'anaviy usullar bilan qayta ishlash qiyin bo'lgan juda katta hajmli, tez o'zgaruvchan va xilma-xil ma'lumotlar to'plami.", category: "Data", imageUrl: AI_IMAGES.data },

    // --- 2. LEARNING TYPES ---
    { term: "Supervised Learning", slug: "supervised-learning", definition: "Nazorat ostida o'rganish - modelga kirish ma'lumotlari bilan birga to'g'ri javoblar ham beriladigan usul.", category: "ML Turlari", imageUrl: AI_IMAGES.brain },
    { term: "Unsupervised Learning", slug: "unsupervised-learning", definition: "Nazoratsiz o'rganish - modelga faqat ma'lumotlar beriladi, javoblar esa yo'q (masalan, klasterlash).", category: "ML Turlari", imageUrl: AI_IMAGES.brain },
    { term: "Reinforcement Learning", slug: "reinforcement-learning", definition: "Mustahkamlovchi o'rganish - agent mukofot va jazo tizimi orqali to'g'ri harakat qilishni o'rganadi.", category: "ML Turlari", imageUrl: AI_IMAGES.robot },
    { term: "Semi-supervised Learning", slug: "semi-supervised-learning", definition: "Yarim nazoratli o'rganish - oz miqdordagi belgilangan va ko'p miqdordagi belgilanmagan ma'lumotlardan foydalanish.", category: "ML Turlari", imageUrl: AI_IMAGES.brain },
    { term: "Self-supervised Learning", slug: "self-supervised-learning", definition: "O'z-o'zini nazorat qilish - model ma'lumotlarning bir qismidan boshqa qismini bashorat qilib o'rganadi.", category: "ML Turlari", imageUrl: AI_IMAGES.brain },
    { term: "Transfer Learning", slug: "transfer-learning", definition: "Transfer o'rganish - bir vazifa uchun olingan bilimni boshqa vazifada qo'llash.", category: "ML Turlari", imageUrl: AI_IMAGES.network },
    { term: "Federated Learning", slug: "federated-learning", definition: "Federativ o'rganish - ma'lumotlarni markaziy serverga yubormasdan, qurilmalarning o'zida modelni o'qitish usuli (maxfiylik uchun).", category: "ML Turlari", imageUrl: AI_IMAGES.security },

    // --- 3. NEURAL NETWORKS ---
    { term: "Neural Network", slug: "neural-network", definition: "Neyron tarmoq - miya hujayralari (neyronlar) ishlash prinsipiga asoslangan hisoblash modeli.", category: "DL Asoslari", imageUrl: AI_IMAGES.network },
    { term: "Perceptron", slug: "perceptron", definition: "Perseptron - neyron tarmoqning eng oddiy shakli, bitta neyronli model.", category: "DL Asoslari", imageUrl: AI_IMAGES.network },
    { term: "Layer", slug: "layer", definition: "Qatlam - neyronlar joylashgan qator. Kirish, yashirin va chiqish qatlamlari bo'ladi.", category: "DL Asoslari", imageUrl: AI_IMAGES.network },
    { term: "Hidden Layer", slug: "hidden-layer", definition: "Yashirin qatlam - kirish va chiqish qatlamlari orasidagi, asosiy hisob-kitoblar bajariladigan qatlam.", category: "DL Asoslari", imageUrl: AI_IMAGES.network },
    { term: "Activation Function", slug: "activation-function", definition: "Faollashtirish funksiyasi - neyronning chiqish qiymatini belgilovchi matematik formula (ReLU, Sigmoid).", category: "DL Asoslari", imageUrl: AI_IMAGES.code },
    { term: "ReLU", slug: "relu", definition: "Rectified Linear Unit - manfiy qiymatlarni 0 ga aylantiruvchi, eng ko'p ishlatiladigan faollashtirish funksiyasi.", category: "DL Asoslari", imageUrl: AI_IMAGES.code },
    { term: "Sigmoid", slug: "sigmoid", definition: "Sigmoid - qiymatlarni 0 va 1 oralig'iga siquvchi silliq egri chiziqli funksiya.", category: "DL Asoslari", imageUrl: AI_IMAGES.code },
    { term: "Softmax", slug: "softmax", definition: "Softmax - chiqish qiymatlarini ehtimolliklarga (yig'indisi 1 bo'lgan) aylantiruvchi funksiya.", category: "DL Asoslari", imageUrl: AI_IMAGES.code },
    { term: "Backpropagation", slug: "backpropagation", definition: "Orqaga tarqalish - xatolikni tarmoq bo'ylab orqaga qaytarib, vaznlarni yangilash algoritmi.", category: "DL Asoslari", imageUrl: AI_IMAGES.code },
    { term: "Gradient Descent", slug: "gradient-descent", definition: "Gradient tushish - xatolikni minimallashtirish uchun eng maqbul vazn qiymatlarini topish usuli.", category: "DL Asoslari", imageUrl: AI_IMAGES.code },
    { term: "Stochastic Gradient Descent", slug: "sgd", definition: "SGD - gradient tushishning bir turi bo'lib, har bir qadamda tasodifiy namunalar guruhidan foydalanadi.", category: "DL Asoslari", imageUrl: AI_IMAGES.code },
    { term: "Batch", slug: "batch", definition: "Batch - modelni bir marta yangilash uchun ishlatiladigan ma'lumotlar guruhi.", category: "DL Asoslari", imageUrl: AI_IMAGES.data },
    { term: "Epoch", slug: "epoch", definition: "Epoxa - model butun o'quv ma'lumotlarini bir marta to'liq ko'rib chiqishi.", category: "DL Asoslari", imageUrl: AI_IMAGES.data },
    { term: "Learning Rate", slug: "learning-rate", definition: "O'rganish tezligi - model har bir qadamda qanchalik katta o'zgarish qilishini belgilovchi parametr.", category: "DL Asoslari", imageUrl: AI_IMAGES.code },
    { term: "Dropout", slug: "dropout", definition: "Dropout - overfittingni oldini olish uchun tasodifiy neyronlarni vaqtincha o'chirib turish usuli.", category: "DL Asoslari", imageUrl: AI_IMAGES.network },

    // --- 4. NLP ---
    { term: "NLP", slug: "nlp", definition: "Natural Language Processing - inson tilini tushunish va qayta ishlashga qaratilgan AI sohasi.", category: "NLP", imageUrl: AI_IMAGES.abstract },
    { term: "LLM", slug: "llm", definition: "Large Language Model - ulkan matnlar bazasida o'qitilgan, matn yaratish va tushunishga qodir model.", category: "NLP", imageUrl: AI_IMAGES.brain },
    { term: "Token", slug: "token", definition: "Token - LLM uchun matnning eng kichik birligi (so'z, bo'g'in yoki harf).", category: "NLP", imageUrl: AI_IMAGES.code },
    { term: "Embedding", slug: "embedding", definition: "Embedding - so'zning ma'nosini raqamli vektor shaklida ifodalash.", category: "NLP", imageUrl: AI_IMAGES.code },
    { term: "Transformer", slug: "transformer", definition: "Transformer - Attention mexanizmiga asoslangan inqilobiy neyron tarmoq arxitekturasi.", category: "NLP", imageUrl: AI_IMAGES.network },
    { term: "Attention", slug: "attention", definition: "Diqqat mexanizmi - modelga matnning eng muhim qismlariga fokus qilish imkonini beradi.", category: "NLP", imageUrl: AI_IMAGES.brain },
    { term: "Self-Attention", slug: "self-attention", definition: "O'z-o'ziga diqqat - gapdagi so'zlarning bir-biri bilan aloqasini aniqlash.", category: "NLP", imageUrl: AI_IMAGES.brain },
    { term: "Sentiment Analysis", slug: "sentiment-analysis", definition: "Hissiyotlar tahlili - matnning hissiy bo'yog'ini (ijobiy, salbiy) aniqlash.", category: "NLP", imageUrl: AI_IMAGES.abstract },
    { term: "NER", slug: "ner", definition: "Named Entity Recognition - matndagi ismlar, joylar va sanalarni ajratib olish.", category: "NLP", imageUrl: AI_IMAGES.code },
    { term: "Stemming", slug: "stemming", definition: "Stemming - so'zlarni o'zak holatiga keltirish jarayoni.", category: "NLP", imageUrl: AI_IMAGES.code },
    { term: "Lemmatization", slug: "lemmatization", definition: "Lemmatizatsiya - so'zlarni lug'aviy ma'nosiga qarab boshlang'ich shaklga keltirish.", category: "NLP", imageUrl: AI_IMAGES.code },
    { term: "Bag of Words", slug: "bow", definition: "Matnni so'zlar chastotasi sifatida ifodalashning oddiy usuli.", category: "NLP", imageUrl: AI_IMAGES.data },
    { term: "Word2Vec", slug: "word2vec", definition: "So'zlarni vektorlarga aylantiruvchi mashhur algoritm.", category: "NLP", imageUrl: AI_IMAGES.code },
    { term: "Prompt Engineering", slug: "prompt-engineering", definition: "Prompt muhandisligi - LLMdan to'g'ri javob olish uchun so'rovlarni optimallashtirish.", category: "NLP", imageUrl: AI_IMAGES.code },
    { term: "Fine-tuning", slug: "fine-tuning", definition: "Modelni maxsus ma'lumotlar bilan qayta o'qitib, ma'lum sohaga moslashtirish.", category: "NLP", imageUrl: AI_IMAGES.chip },
    { term: "RAG", slug: "rag", definition: "Retrieval-Augmented Generation - javoblarni tashqi manbalar bilan boyitish.", category: "NLP", imageUrl: AI_IMAGES.network },
    { term: "Zero-shot", slug: "zero-shot", definition: "Modelning oldindan ko'rmagan vazifani faqat tavsif orqali bajarishi.", category: "NLP", imageUrl: AI_IMAGES.brain },
    { term: "Few-shot", slug: "few-shot", definition: "Modelga bir nechta misol berish orqali vazifani tushuntirish.", category: "NLP", imageUrl: AI_IMAGES.code },
    { term: "Chain of Thought", slug: "cot", definition: "Modelni bosqichma-bosqich fikrlashga undash usuli.", category: "NLP", imageUrl: AI_IMAGES.abstract },
    { term: "Hallucination", slug: "hallucination", definition: "Modelning ishonch bilan noto'g'ri ma'lumot berishi.", category: "NLP", imageUrl: AI_IMAGES.robot },

    // --- 5. COMPUTER VISION ---
    { term: "Computer Vision", slug: "computer-vision", definition: "Kompyuter ko'rish - kompyuterlarga tasvir va videolarni tushunishni o'rgatish.", category: "CV", imageUrl: AI_IMAGES.future },
    { term: "CNN", slug: "cnn", definition: "Convolutional Neural Network - tasvirlarni tahlil qilish uchun maxsus tarmoq.", category: "CV", imageUrl: AI_IMAGES.network },
    { term: "Pixel", slug: "pixel", definition: "Piksel - raqamli tasvirning eng kichik nuqtasi.", category: "CV", imageUrl: AI_IMAGES.abstract },
    { term: "Object Detection", slug: "object-detection", definition: "Rasmdagi ob'ektlarni topish va ularni ramkaga olish.", category: "CV", imageUrl: AI_IMAGES.robot },
    { term: "Image Segmentation", slug: "segmentation", definition: "Rasmdagi har bir pikselni ma'lum sinfga ajratish.", category: "CV", imageUrl: AI_IMAGES.abstract },
    { term: "YOLO", slug: "yolo", definition: "You Only Look Once - tezkor ob'ekt aniqlash algoritmi.", category: "CV", imageUrl: AI_IMAGES.robot },
    { term: "OCR", slug: "ocr", definition: "Optical Character Recognition - rasmdagi matnni o'qish.", category: "CV", imageUrl: AI_IMAGES.code },
    { term: "Facial Recognition", slug: "facial-recognition", definition: "Yuzni aniqlash va tanish texnologiyasi.", category: "CV", imageUrl: AI_IMAGES.security },
    { term: "GAN", slug: "gan", definition: "Generative Adversarial Network - rasm yaratuvchi raqobatli tarmoqlar.", category: "CV", imageUrl: AI_IMAGES.abstract },
    { term: "Stable Diffusion", slug: "stable-diffusion", definition: "Matndan rasm yaratuvchi diffuziya modeli.", category: "CV", imageUrl: AI_IMAGES.future },
    { term: "Midjourney", slug: "midjourney", definition: "Badiiy tasvirlar yaratuvchi mashhur AI servisi.", category: "CV", imageUrl: AI_IMAGES.future },
    { term: "DALL-E", slug: "dalle", definition: "OpenAI tomonidan yaratilgan rasm generatori.", category: "CV", imageUrl: AI_IMAGES.future },
    { term: "Style Transfer", slug: "style-transfer", definition: "Bir rasm uslubini ikkinchi rasmga ko'chirish.", category: "CV", imageUrl: AI_IMAGES.abstract },
    { term: "Augmentation", slug: "augmentation", definition: "Rasmlarni o'zgartirish (burish, qirqish) orqali ma'lumotlar bazasini sun'iy ko'paytirish.", category: "CV", imageUrl: AI_IMAGES.data },

    // --- 6. ETHICS & SAFETY ---
    { term: "AI Ethics", slug: "ai-ethics", definition: "AI etikasi - sun'iy intellektni ishlab chiqish va qo'llashdagi axloqiy me'yorlar.", category: "Etika", imageUrl: AI_IMAGES.security },
    { term: "Bias", slug: "bias", definition: "Bias - modelning noxolisligi yoki kamsitishi.", category: "Etika", imageUrl: AI_IMAGES.security },
    { term: "Fairness", slug: "fairness", definition: "Adolatlilik - modelning barcha guruhlar uchun teng ishlashini ta'minlash.", category: "Etika", imageUrl: AI_IMAGES.security },
    { term: "Transparency", slug: "transparency", definition: "Shaffoflik - model qanday qaror qabul qilganini tushunish imkoniyati.", category: "Etika", imageUrl: AI_IMAGES.code },
    { term: "Explainability", slug: "xai", definition: "Modellarning qarorlarini inson tushunadigan tilda izohlash.", category: "Etika", imageUrl: AI_IMAGES.code },
    { term: "Deepfake", slug: "deepfake", definition: "AI yordamida yaratilgan soxta video va audio.", category: "Muammolar", imageUrl: AI_IMAGES.robot },
    { term: "Privacy", slug: "privacy", definition: "Foydalanuvchi ma'lumotlarini himoya qilish.", category: "Muammolar", imageUrl: AI_IMAGES.security },
    { term: "Alignment", slug: "alignment", definition: "AI maqsadlarini insoniyat qadriyatlariga moslashtirish.", category: "Etika", imageUrl: AI_IMAGES.future },
    { term: "AGI", slug: "agi", definition: "Artificial General Intelligence - inson darajasidagi umumiy aql.", category: "Nazariya", imageUrl: AI_IMAGES.future },
    { term: "Singularity", slug: "singularity", definition: "Texnologik singulyarllik - AI inson nazoratidan chiqib ketadigan nuqta.", category: "Nazariya", imageUrl: AI_IMAGES.future },
    { term: "Job Displacement", slug: "job-displacement", definition: "AI tufayli ish o'rinlarining yo'qolishi yoki o'zgarishi.", category: "Jamiyat", imageUrl: AI_IMAGES.robot },
    { term: "Copyright", slug: "copyright", definition: "AI yaratgan asarlarning mualliflik huquqi muammolari.", category: "Huquq", imageUrl: AI_IMAGES.abstract },

    // --- 7. HARDWARE ---
    { term: "GPU", slug: "gpu", definition: "Grafik protsessor - AI hisob-kitoblari uchun asosiy chip.", category: "Hardware", imageUrl: AI_IMAGES.chip },
    { term: "TPU", slug: "tpu", definition: "Tensor Processing Unit - Google tomonidan AI uchun maxsus yaratilgan chip.", category: "Hardware", imageUrl: AI_IMAGES.chip },
    { term: "NPU", slug: "npu", definition: "Neural Processing Unit - mobil qurilmalardagi AI chipi.", category: "Hardware", imageUrl: AI_IMAGES.chip },
    { term: "FPGA", slug: "fpga", definition: "Dasturlanadigan mantiqiy integral sxema.", category: "Hardware", imageUrl: AI_IMAGES.chip },
    { term: "CUDA", slug: "cuda", definition: "NVIDIA GPUlarida hisoblash uchun dasturiy platforma.", category: "Hardware", imageUrl: AI_IMAGES.code },
    { term: "Moore's Law", slug: "moores-law", definition: "Tranzistorlar soni har 2 yilda ikki baravar oshishi haqidagi qonuniyat.", category: "Hardware", imageUrl: AI_IMAGES.chip },
    { term: "Datacenter", slug: "datacenter", definition: "Ma'lumotlar markazi - minglab serverlar saqlanadigan bino.", category: "Hardware", imageUrl: AI_IMAGES.network },
    { term: "Cloud Computing", slug: "cloud", definition: "Bulutli hisoblash - resurslarni internet orqali ijaraga olish.", category: "Hardware", imageUrl: AI_IMAGES.network },
    { term: "Edge AI", slug: "edge-ai", definition: "AIning qurilmaning o'zida (internetssiz) ishlashi.", category: "Hardware", imageUrl: AI_IMAGES.chip },
    { term: "IoT", slug: "iot", definition: "Internet of Things - internetga ulangan aqlli qurilmalar tarmog'i.", category: "Hardware", imageUrl: AI_IMAGES.network },

    // --- 8. TOOLS & LIBS ---
    { term: "Python", slug: "python", definition: "AI sohasidagi eng mashhur dasturlash tili.", category: "Tools", imageUrl: AI_IMAGES.code },
    { term: "TensorFlow", slug: "tensorflow", definition: "Google tomonidan yaratilgan ML kutubxonasi.", category: "Tools", imageUrl: AI_IMAGES.code },
    { term: "PyTorch", slug: "pytorch", definition: "Facebook (Meta) tomonidan yaratilgan ML kutubxonasi.", category: "Tools", imageUrl: AI_IMAGES.code },
    { term: "Keras", slug: "keras", definition: "TensorFlow ustiga qurilgan sodda neyron tarmoq kutubxonasi.", category: "Tools", imageUrl: AI_IMAGES.code },
    { term: "Scikit-learn", slug: "sklearn", definition: "Klassik ML algoritmlari uchun mashhur kutubxona.", category: "Tools", imageUrl: AI_IMAGES.code },
    { term: "Pandas", slug: "pandas", definition: "Ma'lumotlarni tahlil qilish va qayta ishlash vositasi.", category: "Tools", imageUrl: AI_IMAGES.data },
    { term: "NumPy", slug: "numpy", definition: "Matematik va massivlar bilan ishlash kutubxonasi.", category: "Tools", imageUrl: AI_IMAGES.code },
    { term: "Matplotlib", slug: "matplotlib", definition: "Ma'lumotlarni vizualizatsiya qilish (grafiklar chizish) kutubxonasi.", category: "Tools", imageUrl: AI_IMAGES.data },
    { term: "Jupyter", slug: "jupyter", definition: "Kod va matnni birlashtiruvchi interaktiv muhit.", category: "Tools", imageUrl: AI_IMAGES.code },
    { term: "Hugging Face", slug: "hugging-face", definition: "AI modellari va datasetlari uchun eng katta platforma.", category: "Tools", imageUrl: AI_IMAGES.robot },
    { term: "LangChain", slug: "langchain", definition: "LLM asosida ilovalar yaratish uchun freymvork.", category: "Tools", imageUrl: AI_IMAGES.network },
    { term: "OpenCV", slug: "opencv", definition: "Kompyuter ko'rish uchun ochiq kodli kutubxona.", category: "Tools", imageUrl: AI_IMAGES.future },

    // --- 9. METRICS ---
    { term: "Accuracy", slug: "accuracy", definition: "Aniqlik - to'g'ri javoblar ulushi.", category: "Metrika", imageUrl: AI_IMAGES.data },
    { term: "Precision", slug: "precision", definition: "Precision - to'g'ri deb topilganlarning haqiqiy to'g'riligi.", category: "Metrika", imageUrl: AI_IMAGES.data },
    { term: "Recall", slug: "recall", definition: "Recall - barcha to'g'ri javoblarning qanchasi topilganligi.", category: "Metrika", imageUrl: AI_IMAGES.data },
    { term: "F1-Score", slug: "f1", definition: "Precision va Recall o'rtasidagi muvozanat.", category: "Metrika", imageUrl: AI_IMAGES.data },
    { term: "MSE", slug: "mse", definition: "Mean Squared Error - o'rtacha kvadratik xatolik.", category: "Metrika", imageUrl: AI_IMAGES.data },
    { term: "Loss", slug: "loss", definition: "Xatolik qiymati - modelning maqsaddan qanchalik uzoqligi.", category: "Metrika", imageUrl: AI_IMAGES.data },
    { term: "Confusion Matrix", slug: "confusion-matrix", definition: "Klassifikatsiya natijalarini ko'rsatuvchi jadval.", category: "Metrika", imageUrl: AI_IMAGES.data },
    { term: "ROC Curve", slug: "roc", definition: "Model samaradorligini ko'rsatuvchi egri chiziq.", category: "Metrika", imageUrl: AI_IMAGES.data },
    { term: "AUC", slug: "auc", definition: "Area Under Curve - ROC egri chizig'i ostidagi yuza.", category: "Metrika", imageUrl: AI_IMAGES.data },

    // --- 10. HISTORY & PEOPLE ---
    { term: "Alan Turing", slug: "alan-turing", definition: "Kompyuter fanlari otasi, Turing testi muallifi.", category: "Tarix", imageUrl: AI_IMAGES.future },
    { term: "John McCarthy", slug: "mccarthy", definition: "\"Sun'iy intellekt\" terminini kiritgan olim.", category: "Tarix", imageUrl: AI_IMAGES.future },
    { term: "Geoffrey Hinton", slug: "hinton", definition: "Chuqur o'rganish (Deep Learning) \"cho'qintirgan otasi\".", category: "Tarix", imageUrl: AI_IMAGES.brain },
    { term: "Yann LeCun", slug: "lecun", definition: "CNN arxitekturasi yaratuvchisi, Meta AI rahbari.", category: "Tarix", imageUrl: AI_IMAGES.brain },
    { term: "Andrew Ng", slug: "andrew-ng", definition: "AI ta'limi targ'ibotchisi, Coursera asoschisi.", category: "Tarix", imageUrl: AI_IMAGES.brain },
    { term: "Sam Altman", slug: "sam-altman", definition: "OpenAI CEOsi, ChatGPT ortidagi shaxs.", category: "Tarix", imageUrl: AI_IMAGES.robot },
    { term: "Demis Hassabis", slug: "hassabis", definition: "DeepMind asoschisi, AlphaGo yaratuvchisi.", category: "Tarix", imageUrl: AI_IMAGES.brain },
    { term: "Deep Blue", slug: "deep-blue", definition: "Garry Kasparovni shaxmatda yenggan IBM kompyuteri (1997).", category: "Tarix", imageUrl: AI_IMAGES.chip },
    { term: "AlphaGo", slug: "alphago", definition: "Go o'yinida inson chempionini yenggan birinchi AI.", category: "Tarix", imageUrl: AI_IMAGES.game },
    { term: "Eliza", slug: "eliza", definition: "1960-yillarda yaratilgan birinchi chatbotlardan biri.", category: "Tarix", imageUrl: AI_IMAGES.code },

    // --- 11. COMPANIES ---
    { term: "OpenAI", slug: "openai", definition: "ChatGPT va DALL-E ni yaratgan yetakchi AI kompaniyasi.", category: "Kompaniya", imageUrl: AI_IMAGES.future },
    { term: "DeepMind", slug: "deepmind", definition: "Googlega tegishli, AGI yaratishni maqsad qilgan laboratoriya.", category: "Kompaniya", imageUrl: AI_IMAGES.future },
    { term: "Anthropic", slug: "anthropic", definition: "Claude modelini yaratgan, xavfsizlikka yo'naltirilgan kompaniya.", category: "Kompaniya", imageUrl: AI_IMAGES.future },
    { term: "Meta AI", slug: "meta-ai", definition: "Facebookning AI bo'limi, Llama va PyTorch yaratuvisi.", category: "Kompaniya", imageUrl: AI_IMAGES.future },
    { term: "NVIDIA", slug: "nvidia", definition: "AI chiplari (GPU) bo'yicha dunyo yetakchisi.", category: "Kompaniya", imageUrl: AI_IMAGES.chip },
    { term: "Microsoft", slug: "microsoft", definition: "OpenAI hamkori, Copilot mahsuloti egasi.", category: "Kompaniya", imageUrl: AI_IMAGES.code },
    { term: "Hugging Face", slug: "hf-company", definition: "Ochiq manbali AI hamjamiyati markazi.", category: "Kompaniya", imageUrl: AI_IMAGES.robot },
    { term: "Mistral AI", slug: "mistral-ai", definition: "Yevropaning yetakchi ochiq manbali model yaratuvchisi.", category: "Kompaniya", imageUrl: AI_IMAGES.future },
];

async function main() {
    console.log(`🌱 Starting ULTIMATE Glossary Seeding with ${terms.length} terms...`);

    // Dynamic import to ensure env vars are loaded first
    const { db } = await import("../db");
    const { glossary } = await import("../db/schema");

    let count = 0;

    // Clear existing to avoid duplicate slug issues if needed, or just upsert
    // await db.delete(glossary); 

    for (const term of terms) {
        try {
            await db.insert(glossary).values({
                ...term,
                createdAt: new Date(),
            }).onConflictDoNothing();
            count++;
            if (count % 10 === 0) process.stdout.write('.');
        } catch (e) {
            // console.error(`Failed: ${term.term}`);
        }
    }

    console.log(`\n✅ Successfully populated ${count} terms with images!`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
