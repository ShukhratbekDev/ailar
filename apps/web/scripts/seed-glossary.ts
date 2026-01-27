
import { config } from "dotenv";
import type { glossary } from "../db/schema";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

const terms = [
    // --- 1. FUNDAMENTALS (ASOSLAR) ---
    {
        term: "Artificial Intelligence",
        slug: "ai",
        definition: "Sun'iy intellekt (AI) - inson aqliy qobiliyatlarini (o'rganish, fikrlash, muammolarni hal qilish) kompyuter tizimlari orqali simulyatsiya qilish sohasidir.",
        category: "Asoslar",
    },
    {
        term: "Machine Learning",
        slug: "machine-learning",
        definition: "Mashinali o'rganish (ML) - kompyuterlarga aniq dasturlashtirilmasdan ma'lumotlardan o'rganish va qaror qabul qilish imkonini beruvchi AI tarmog'i.",
        category: "Asoslar",
    },
    {
        term: "Deep Learning",
        slug: "deep-learning",
        definition: "Chuqur o'rganish (DL) - ko'p qatlamli sun'iy neyron tarmoqlaridan foydalanib, murakkab ma'lumotlarni (tasvir, ovoz) tahlil qiluvchi ML yo'nalishi.",
        category: "Asoslar",
    },
    {
        term: "Data Science",
        slug: "data-science",
        definition: "Ma'lumotlar fani - ilmiy usullar, jarayonlar va algoritmlar yordamida tuzilgan va tuzilmagan ma'lumotlardan bilim va xulosalar olish sohasi.",
        category: "Asoslar",
    },
    {
        term: "Algorithm",
        slug: "algorithm",
        definition: "Algoritm - aniq bir muammoni hal qilish uchun bajarilishi kerak bo'lgan ketma-ket ko'rsatmalar to'plami.",
        category: "Asoslar",
    },
    {
        term: "Model",
        slug: "model",
        definition: "Model - ma'lumotlar asosida o'qitilgan algoritmning natijasi. U yangi ma'lumotlarni qabul qilib, bashorat yoki qaror chiqaradi.",
        category: "Asoslar",
    },
    { term: "Training", slug: "training", definition: "O'qitish - modelga kirish ma'lumotlari (input) va to'g'ri javoblar o'rtasidagi bog'liqlikni topishni o'rgatish jarayoni.", category: "Asoslar" },
    { term: "Testing", slug: "testing", definition: "Sinov - modelning ilgari ko'rmagan ma'lumotlarda qanchalik to'g'ri ishlashini tekshirish jarayoni.", category: "Asoslar" },
    { term: "Dataset", slug: "dataset", definition: "Ma'lumotlar to'plami - modelni o'qitish yoki sinash uchun ishlatiladigan tartiblangan ma'lumotlar yig'indisi.", category: "Data" },
    { term: "Big Data", slug: "big-data", definition: "Katta ma'lumotlar - an'anaviy usullar bilan qayta ishlash qiyin bo'lgan juda katta hajmli, tez o'zgaruvchan va xilma-xil ma'lumotlar to'plami.", category: "Data" },

    // --- 2. LEARNING TYPES ---
    { term: "Supervised Learning", slug: "supervised-learning", definition: "Nazorat ostida o'rganish - modelga kirish ma'lumotlari bilan birga to'g'ri javoblar ham beriladigan usul.", category: "ML Turlari" },
    { term: "Unsupervised Learning", slug: "unsupervised-learning", definition: "Nazoratsiz o'rganish - modelga faqat ma'lumotlar beriladi, javoblar esa yo'q (masalan, klasterlash).", category: "ML Turlari" },
    { term: "Reinforcement Learning", slug: "reinforcement-learning", definition: "Mustahkamlovchi o'rganish - agent mukofot va jazo tizimi orqali to'g'ri harakat qilishni o'rganadi.", category: "ML Turlari" },
    { term: "Semi-supervised Learning", slug: "semi-supervised-learning", definition: "Yarim nazoratli o'rganish - oz miqdordagi belgilangan va ko'p miqdordagi belgilanmagan ma'lumotlardan foydalanish.", category: "ML Turlari" },
    { term: "Self-supervised Learning", slug: "self-supervised-learning", definition: "O'z-o'zini nazorat qilish - model ma'lumotlarning bir qismidan boshqa qismini bashorat qilib o'rganadi.", category: "ML Turlari" },
    { term: "Transfer Learning", slug: "transfer-learning", definition: "Transfer o'rganish - bir vazifa uchun olingan bilimni boshqa vazifada qo'llash.", category: "ML Turlari" },
    { term: "Federated Learning", slug: "federated-learning", definition: "Federativ o'rganish - ma'lumotlarni markaziy serverga yubormasdan, qurilmalarning o'zida modelni o'qitish usuli (maxfiylik uchun).", category: "ML Turlari" },

    // --- 3. NEURAL NETWORKS ---
    { term: "Neural Network", slug: "neural-network", definition: "Neyron tarmoq - miya hujayralari (neyronlar) ishlash prinsipiga asoslangan hisoblash modeli.", category: "DL Asoslari" },
    { term: "Perceptron", slug: "perceptron", definition: "Perseptron - neyron tarmoqning eng oddiy shakli, bitta neyronli model.", category: "DL Asoslari" },
    { term: "Layer", slug: "layer", definition: "Qatlam - neyronlar joylashgan qator. Kirish, yashirin va chiqish qatlamlari bo'ladi.", category: "DL Asoslari" },
    { term: "Hidden Layer", slug: "hidden-layer", definition: "Yashirin qatlam - kirish va chiqish qatlamlari orasidagi, asosiy hisob-kitoblar bajariladigan qatlam.", category: "DL Asoslari" },
    { term: "Activation Function", slug: "activation-function", definition: "Faollashtirish funksiyasi - neyronning chiqish qiymatini belgilovchi matematik formula (ReLU, Sigmoid).", category: "DL Asoslari" },
    { term: "ReLU", slug: "relu", definition: "Rectified Linear Unit - manfiy qiymatlarni 0 ga aylantiruvchi, eng ko'p ishlatiladigan faollashtirish funksiyasi.", category: "DL Asoslari" },
    { term: "Sigmoid", slug: "sigmoid", definition: "Sigmoid - qiymatlarni 0 va 1 oralig'iga siquvchi silliq egri chiziqli funksiya.", category: "DL Asoslari" },
    { term: "Softmax", slug: "softmax", definition: "Softmax - chiqish qiymatlarini ehtimolliklarga (yig'indisi 1 bo'lgan) aylantiruvchi funksiya.", category: "DL Asoslari" },
    { term: "Backpropagation", slug: "backpropagation", definition: "Orqaga tarqalish - xatolikni tarmoq bo'ylab orqaga qaytarib, vaznlarni yangilash algoritmi.", category: "DL Asoslari" },
    { term: "Gradient Descent", slug: "gradient-descent", definition: "Gradient tushish - xatolikni minimallashtirish uchun eng maqbul vazn qiymatlarini topish usuli.", category: "DL Asoslari" },
    { term: "Stochastic Gradient Descent", slug: "sgd", definition: "SGD - gradient tushishning bir turi bo'lib, har bir qadamda tasodifiy namunalar guruhidan foydalanadi.", category: "DL Asoslari" },
    { term: "Batch", slug: "batch", definition: "Batch - modelni bir marta yangilash uchun ishlatiladigan ma'lumotlar guruhi.", category: "DL Asoslari" },
    { term: "Epoch", slug: "epoch", definition: "Epoxa - model butun o'quv ma'lumotlarini bir marta to'liq ko'rib chiqishi.", category: "DL Asoslari" },
    { term: "Learning Rate", slug: "learning-rate", definition: "O'rganish tezligi - model har bir qadamda qanchalik katta o'zgarish qilishini belgilovchi parametr.", category: "DL Asoslari" },
    { term: "Dropout", slug: "dropout", definition: "Dropout - overfittingni oldini olish uchun tasodifiy neyronlarni vaqtincha o'chirib turish usuli.", category: "DL Asoslari" },

    // --- 4. NLP ---
    { term: "NLP", slug: "nlp", definition: "Natural Language Processing - inson tilini tushunish va qayta ishlashga qaratilgan AI sohasi.", category: "NLP" },
    { term: "LLM", slug: "llm", definition: "Large Language Model - ulkan matnlar bazasida o'qitilgan, matn yaratish va tushunishga qodir model.", category: "NLP" },
    { term: "Token", slug: "token", definition: "Token - LLM uchun matnning eng kichik birligi (so'z, bo'g'in yoki harf).", category: "NLP" },
    { term: "Embedding", slug: "embedding", definition: "Embedding - so'zning ma'nosini raqamli vektor shaklida ifodalash.", category: "NLP" },
    { term: "Transformer", slug: "transformer", definition: "Transformer - Attention mexanizmiga asoslangan inqilobiy neyron tarmoq arxitekturasi.", category: "NLP" },
    { term: "Attention", slug: "attention", definition: "Diqqat mexanizmi - modelga matnning eng muhim qismlariga fokus qilish imkonini beradi.", category: "NLP" },
    { term: "Self-Attention", slug: "self-attention", definition: "O'z-o'ziga diqqat - gapdagi so'zlarning bir-biri bilan aloqasini aniqlash.", category: "NLP" },
    { term: "Sentiment Analysis", slug: "sentiment-analysis", definition: "Hissiyotlar tahlili - matnning hissiy bo'yog'ini (ijobiy, salbiy) aniqlash.", category: "NLP" },
    { term: "NER", slug: "ner", definition: "Named Entity Recognition - matndagi ismlar, joylar va sanalarni ajratib olish.", category: "NLP" },
    { term: "Stemming", slug: "stemming", definition: "Stemming - so'zlarni o'zak holatiga keltirish jarayoni.", category: "NLP" },
    { term: "Lemmatization", slug: "lemmatization", definition: "Lemmatizatsiya - so'zlarni lug'aviy ma'nosiga qarab boshlang'ich shaklga keltirish.", category: "NLP" },
    { term: "Bag of Words", slug: "bow", definition: "Matnni so'zlar chastotasi sifatida ifodalashning oddiy usuli.", category: "NLP" },
    { term: "Word2Vec", slug: "word2vec", definition: "So'zlarni vektorlarga aylantiruvchi mashhur algoritm.", category: "NLP" },
    { term: "Prompt Engineering", slug: "prompt-engineering", definition: "Prompt muhandisligi - LLMdan to'g'ri javob olish uchun so'rovlarni optimallashtirish.", category: "NLP" },
    { term: "Fine-tuning", slug: "fine-tuning", definition: "Modelni maxsus ma'lumotlar bilan qayta o'qitib, ma'lum sohaga moslashtirish.", category: "NLP" },
    { term: "RAG", slug: "rag", definition: "Retrieval-Augmented Generation - javoblarni tashqi manbalar bilan boyitish.", category: "NLP" },
    { term: "Zero-shot", slug: "zero-shot", definition: "Modelning oldindan ko'rmagan vazifani faqat tavsif orqali bajarishi.", category: "NLP" },
    { term: "Few-shot", slug: "few-shot", definition: "Modelga bir nechta misol berish orqali vazifani tushuntirish.", category: "NLP" },
    { term: "Chain of Thought", slug: "cot", definition: "Modelni bosqichma-bosqich fikrlashga undash usuli.", category: "NLP" },
    { term: "Hallucination", slug: "hallucination", definition: "Modelning ishonch bilan noto'g'ri ma'lumot berishi.", category: "NLP" },

    // --- 5. COMPUTER VISION ---
    { term: "Computer Vision", slug: "computer-vision", definition: "Kompyuter ko'rish - kompyuterlarga tasvir va videolarni tushunishni o'rgatish.", category: "CV" },
    { term: "CNN", slug: "cnn", definition: "Convolutional Neural Network - tasvirlarni tahlil qilish uchun maxsus tarmoq.", category: "CV" },
    { term: "Pixel", slug: "pixel", definition: "Piksel - raqamli tasvirning eng kichik nuqtasi.", category: "CV" },
    { term: "Object Detection", slug: "object-detection", definition: "Rasmdagi ob'ektlarni topish va ularni ramkaga olish.", category: "CV" },
    { term: "Image Segmentation", slug: "segmentation", definition: "Rasmdagi har bir pikselni ma'lum sinfga ajratish.", category: "CV" },
    { term: "YOLO", slug: "yolo", definition: "You Only Look Once - tezkor ob'ekt aniqlash algoritmi.", category: "CV" },
    { term: "OCR", slug: "ocr", definition: "Optical Character Recognition - rasmdagi matnni o'qish.", category: "CV" },
    { term: "Facial Recognition", slug: "facial-recognition", definition: "Yuzni aniqlash va tanish texnologiyasi.", category: "CV" },
    { term: "GAN", slug: "gan", definition: "Generative Adversarial Network - rasm yaratuvchi raqobatli tarmoqlar.", category: "CV" },
    { term: "Stable Diffusion", slug: "stable-diffusion", definition: "Matndan rasm yaratuvchi diffuziya modeli.", category: "CV" },
    { term: "Midjourney", slug: "midjourney", definition: "Badiiy tasvirlar yaratuvchi mashhur AI servisi.", category: "CV" },
    { term: "DALL-E", slug: "dalle", definition: "OpenAI tomonidan yaratilgan rasm generatori.", category: "CV" },
    { term: "Style Transfer", slug: "style-transfer", definition: "Bir rasm uslubini ikkinchi rasmga ko'chirish.", category: "CV" },
    { term: "Augmentation", slug: "augmentation", definition: "Rasmlarni o'zgartirish (burish, qirqish) orqali ma'lumotlar bazasini sun'iy ko'paytirish.", category: "CV" },

    // --- 6. ETHICS & SAFETY ---
    { term: "AI Ethics", slug: "ai-ethics", definition: "AI etikasi - sun'iy intellektni ishlab chiqish va qo'llashdagi axloqiy me'yorlar.", category: "Etika" },
    { term: "Bias", slug: "bias", definition: "Bias - modelning noxolisligi yoki kamsitishi.", category: "Etika" },
    { term: "Fairness", slug: "fairness", definition: "Adolatlilik - modelning barcha guruhlar uchun teng ishlashini ta'imnlash.", category: "Etika" },
    { term: "Transparency", slug: "transparency", definition: "Shaffoflik - model qanday qaror qabul qilganini tushunish imkoniyati.", category: "Etika" },
    { term: "Explainability", slug: "xai", definition: "Modellarning qarorlarini inson tushunadigan tilda izohlash.", category: "Etika" },
    { term: "Deepfake", slug: "deepfake", definition: "AI yordamida yaratilgan soxta video va audio.", category: "Muammolar" },
    { term: "Privacy", slug: "privacy", definition: "Foydalanuvchi ma'lumotlarini himoya qilish.", category: "Muammolar" },
    { term: "Alignment", slug: "alignment", definition: "AI maqsadlarini insoniyat qadriyatlariga moslashtirish.", category: "Etika" },
    { term: "AGI", slug: "agi", definition: "Artificial General Intelligence - inson darajasidagi umumiy aql.", category: "Nazariya" },
    { term: "Singularity", slug: "singularity", definition: "Texnologik singulyarllik - AI inson nazoratidan chiqib ketadigan nuqta.", category: "Nazariya" },
    { term: "Job Displacement", slug: "job-displacement", definition: "AI tufayli ish o'rinlarining yo'qolishi yoki o'zgarishi.", category: "Jamiyat" },
    { term: "Copyright", slug: "copyright", definition: "AI yaratgan asarlarning mualliflik huquqi muammolari.", category: "Huquq" },

    // --- 7. HARDWARE ---
    { term: "GPU", slug: "gpu", definition: "Grafik protsessor - AI hisob-kitoblari uchun asosiy chip.", category: "Hardware" },
    { term: "TPU", slug: "tpu", definition: "Tensor Processing Unit - Google tomonidan AI uchun maxsus yaratilgan chip.", category: "Hardware" },
    { term: "NPU", slug: "npu", definition: "Neural Processing Unit - mobil qurilmalardagi AI chipi.", category: "Hardware" },
    { term: "FPGA", slug: "fpga", definition: "Dasturlanadigan mantiqiy integral sxema.", category: "Hardware" },
    { term: "CUDA", slug: "cuda", definition: "NVIDIA GPUlarida hisoblash uchun dasturiy platforma.", category: "Hardware" },
    { term: "Moore's Law", slug: "moores-law", definition: "Tranzistorlar soni har 2 yilda ikki baravar oshishi haqidagi qonuniyat.", category: "Hardware" },
    { term: "Datacenter", slug: "datacenter", definition: "Ma'lumotlar markazi - minglab serverlar saqlanadigan bino.", category: "Hardware" },
    { term: "Cloud Computing", slug: "cloud", definition: "Bulutli hisoblash - resurslarni internet orqali ijaraga olish.", category: "Hardware" },
    { term: "Edge AI", slug: "edge-ai", definition: "AIning qurilmaning o'zida (internetssiz) ishlashi.", category: "Hardware" },
    { term: "IoT", slug: "iot", definition: "Internet of Things - internetga ulangan aqlli qurilmalar tarmog'i.", category: "Hardware" },

    // --- 8. TOOLS & LIBS ---
    { term: "Python", slug: "python", definition: "AI sohasidagi eng mashhur dasturlash tili.", category: "Tools" },
    { term: "TensorFlow", slug: "tensorflow", definition: "Google tomonidan yaratilgan ML kutubxonasi.", category: "Tools" },
    { term: "PyTorch", slug: "pytorch", definition: "Facebook (Meta) tomonidan yaratilgan ML kutubxonasi.", category: "Tools" },
    { term: "Keras", slug: "keras", definition: "TensorFlow ustiga qurilgan sodda neyron tarmoq kutubxonasi.", category: "Tools" },
    { term: "Scikit-learn", slug: "sklearn", definition: "Klassik ML algoritmlari uchun mashhur kutubxona.", category: "Tools" },
    { term: "Pandas", slug: "pandas", definition: "Ma'lumotlarni tahlil qilish va qayta ishlash vositasi.", category: "Tools" },
    { term: "NumPy", slug: "numpy", definition: "Matematik va massivlar bilan ishlash kutubxonasi.", category: "Tools" },
    { term: "Matplotlib", slug: "matplotlib", definition: "Ma'lumotlarni vizualizatsiya qilish (grafiklar chizish) kutubxonasi.", category: "Tools" },
    { term: "Jupyter", slug: "jupyter", definition: "Kod va matnni birlashtiruvchi interaktiv muhit.", category: "Tools" },
    { term: "Hugging Face", slug: "hugging-face", definition: "AI modellari va datasetlari uchun eng katta platforma.", category: "Tools" },
    { term: "LangChain", slug: "langchain", definition: "LLM asosida ilovalar yaratish uchun freymvork.", category: "Tools" },
    { term: "OpenCV", slug: "opencv", definition: "Kompyuter ko'rish uchun ochiq kodli kutubxona.", category: "Tools" },

    // --- 9. METRICS ---
    { term: "Accuracy", slug: "accuracy", definition: "Aniqlik - to'g'ri javoblar ulushi.", category: "Metrika" },
    { term: "Precision", slug: "precision", definition: "Precision - to'g'ri deb topilganlarning haqiqiy to'g'riligi.", category: "Metrika" },
    { term: "Recall", slug: "recall", definition: "Recall - barcha to'g'ri javoblarning qanchasi topilganligi.", category: "Metrika" },
    { term: "F1-Score", slug: "f1", definition: "Precision va Recall o'rtasidagi muvozanat.", category: "Metrika" },
    { term: "MSE", slug: "mse", definition: "Mean Squared Error - o'rtacha kvadratik xatolik.", category: "Metrika" },
    { term: "Loss", slug: "loss", definition: "Xatolik qiymati - modelning maqsaddan qanchalik uzoqligi.", category: "Metrika" },
    { term: "Confusion Matrix", slug: "confusion-matrix", definition: "Klassifikatsiya natijalarini ko'rsatuvchi jadval.", category: "Metrika" },
    { term: "ROC Curve", slug: "roc", definition: "Model samaradorligini ko'rsatuvchi egri chiziq.", category: "Metrika" },
    { term: "AUC", slug: "auc", definition: "Area Under Curve - ROC egri chizig'i ostidagi yuza.", category: "Metrika" },

    // --- 10. HISTORY & PEOPLE ---
    { term: "Alan Turing", slug: "alan-turing", definition: "Kompyuter fanlari otasi, Turing testi muallifi.", category: "Tarix" },
    { term: "John McCarthy", slug: "mccarthy", definition: "\"Sun'iy intellekt\" terminini kiritgan olim.", category: "Tarix" },
    { term: "Geoffrey Hinton", slug: "hinton", definition: "Chuqur o'rganish (Deep Learning) \"cho'qintirgan otasi\".", category: "Tarix" },
    { term: "Yann LeCun", slug: "lecun", definition: "CNN arxitekturasi yaratuvchisi, Meta AI rahbari.", category: "Tarix" },
    { term: "Andrew Ng", slug: "andrew-ng", definition: "AI ta'limi targ'ibotchisi, Coursera asoschisi.", category: "Tarix" },
    { term: "Sam Altman", slug: "sam-altman", definition: "OpenAI CEOsi, ChatGPT ortidagi shaxs.", category: "Tarix" },
    { term: "Demis Hassabis", slug: "hassabis", definition: "DeepMind asoschisi, AlphaGo yaratuvchisi.", category: "Tarix" },
    { term: "Deep Blue", slug: "deep-blue", definition: "Garry Kasparovni shaxmatda yenggan IBM kompyuteri (1997).", category: "Tarix" },
    { term: "AlphaGo", slug: "alphago", definition: "Go o'yinida inson chempionini yenggan birinchi AI.", category: "Tarix" },
    { term: "Eliza", slug: "eliza", definition: "1960-yillarda yaratilgan birinchi chatbotlardan biri.", category: "Tarix" },

    // --- 11. COMPANIES ---
    { term: "OpenAI", slug: "openai", definition: "ChatGPT va DALL-E ni yaratgan yetakchi AI kompaniyasi.", category: "Kompaniya" },
    { term: "DeepMind", slug: "deepmind", definition: "Googlega tegishli, AGI yaratishni maqsad qilgan laboratoriya.", category: "Kompaniya" },
    { term: "Anthropic", slug: "anthropic", definition: "Claude modelini yaratgan, xavfsizlikka yo'naltirilgan kompaniya.", category: "Kompaniya" },
    { term: "Meta AI", slug: "meta-ai", definition: "Facebookning AI bo'limi, Llama va PyTorch yaratuvisi.", category: "Kompaniya" },
    { term: "NVIDIA", slug: "nvidia", definition: "AI chiplari (GPU) bo'yicha dunyo yetakchisi.", category: "Kompaniya" },
    { term: "Microsoft", slug: "microsoft", definition: "OpenAI hamkori, Copilot mahsuloti egasi.", category: "Kompaniya" },
    { term: "Hugging Face", slug: "hf-company", definition: "Ochiq manbali AI hamjamiyati markazi.", category: "Kompaniya" },
    { term: "Mistral AI", slug: "mistral-ai", definition: "Yevropaning yetakchi ochiq manbali model yaratuvchisi.", category: "Kompaniya" },
];

async function main() {
    console.log(`🌱 Starting ULTIMATE Glossary Seeding with ${terms.length} terms...`);

    // Dynamic import to ensure env vars are loaded first
    const { db } = await import("../db");
    const { glossary } = await import("../db/schema");

    let count = 0;

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

    console.log(`\n✅ Successfully populated ${count} terms!`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
