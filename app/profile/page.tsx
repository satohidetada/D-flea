"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

// ご提示いただいた GAS Web App URL
const GAS_URL = "https://script.google.com/macros/s/AKfycby8EALWBchN8UKI4_jbSOWTmfkheV4oUAfE1Wes687iBg612rOzO0PVc1vlmY8uTcU/exec";
const SECRET_API_KEY = "my-secret-token-777"; 

export default function ProfileEdit() {
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || "");
        setPhotoURL(user.photoURL || "");
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 画像アップロード処理 (既存のGAS形式)
  const uploadImage = async (file: File) => {
    const user = auth.currentUser;
    if (!user) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result?.toString().split(",")[1];
      
      try {
        const res = await fetch(GAS_URL, {
          method: "POST",
          body: JSON.stringify({
            apiKey: SECRET_API_KEY,
            imageBase64: base64Data,
            fileName: file.name,
            userId: user.uid
          }),
        });

        const data = await res.json();
        
        if (data.url) {
          setPhotoURL(data.url);
          alert("画像のアップロードに成功しました！「プロフィールを保存」を押して確定してください。");
        } else if (data.error) {
          alert("エラー: " + data.error);
        }
      } catch (err) {
        alert("アップロード中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);

    try {
      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL
      });
      alert("プロフィールを更新しました！");
      router.push("/mypage");
    } catch (e: any) {
      alert("更新エラー: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-6">プロフィール編集</h1>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
              {photoURL ? (
                <img src={photoURL} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">👤</div>
              )}
            </div>
            <label className="cursor-pointer bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold hover:bg-red-100 transition">
              写真を変更する
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} 
              />
            </label>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">ニックネーム</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full border-b-2 py-2 focus:border-red-500 outline-none transition bg-transparent text-lg"
                placeholder="名前を入力"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition disabled:bg-gray-300"
            >
              {loading ? "処理中..." : "プロフィールを保存"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
