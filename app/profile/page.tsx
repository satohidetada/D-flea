"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const GAS_URL = "https://script.google.com/macros/s/AKfycby-ey-a-JVlePfdJiCRO_aSNfMgUYnwahAaYKyV4909p7Wq4LvbgEu2cplNTjlsdLkA/exec";
const SECRET_API_KEY = "my-secret-token-777"; 

export default function ProfileEdit() {
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [prefecture, setPrefecture] = useState("東京都");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setName(user.displayName || "");
        setPhotoURL(user.photoURL || "");
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPrefecture(data.prefecture || "東京都");
          setBio(data.bio || "");
          if (data.photoURL) setPhotoURL(data.photoURL);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  /**
   * 画像をブラウザ側で圧縮・リサイズする関数
   */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // 最大幅を800pxに制限（プロフィール用ならこれで十分）
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas context error");
          ctx.drawImage(img, 0, 0, width, height);

          // 画質を0.6 (60%) に落としてJPEGに変換。これで劇的に軽くなる
          const base64 = canvas.toDataURL("image/jpeg", 0.6);
          resolve(base64.split(",")[1]); // データ本体のみを抽出
        };
      };
      reader.onerror = (e) => reject(e);
    });
  };

  /**
   * アップロード処理
   */
  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      // 1. 送信する前に圧縮
      const compressedBase64 = await compressImage(file);

      // 2. 圧縮後のデータを送信
      const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          img: compressedBase64,
          type: "image/jpeg", // 圧縮後は常にjpeg
          key: SECRET_API_KEY,
        }),
      });

      const data = await res.json();
      if (data.url) {
        setPhotoURL(data.url);
      } else {
        throw new Error(data.error || "アップロードに失敗しました");
      }
    } catch (e: any) {
      alert("エラー: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: name, photoURL: photoURL });
      await setDoc(doc(db, "users", user.uid), {
        displayName: name,
        photoURL: photoURL,
        prefecture: prefecture,
        bio: bio,
        updatedAt: new Date()
      }, { merge: true });
      alert("プロフィールを更新しました！");
      router.push("/mypage");
    } catch (e: any) {
      alert("更新エラー: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <Header />
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-6 tracking-tighter">プロフィール編集</h1>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center">
              {photoURL ? (
                <img src={photoURL} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="text-4xl text-gray-300">👤</div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold">
                  処理中...
                </div>
              )}
            </div>
            <label className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full cursor-pointer hover:bg-red-100 transition shadow-sm">
              {uploading ? "軽量化して送信中..." : "写真を変更"}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} 
              />
            </label>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ニックネーム</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-b py-2 focus:border-red-500 outline-none text-lg bg-transparent" required />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">主な活動エリア</label>
              <select 
                value={prefecture} 
                onChange={(e) => setPrefecture(e.target.value)}
                className="w-full border-b py-2 bg-transparent outline-none text-lg"
              >
                {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">自己紹介</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                placeholder="直接手渡し希望です！"
                className="w-full border rounded-2xl p-4 mt-2 h-32 text-sm bg-gray-50 outline-none focus:border-red-500 transition resize-none"
              />
            </div>
            
            <button type="submit" disabled={loading || uploading} className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition disabled:bg-gray-300">
              {loading ? "保存中..." : "変更を確定する"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}