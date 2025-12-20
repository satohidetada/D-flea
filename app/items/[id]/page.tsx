"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase/config";
import { doc, getDoc, deleteDoc, setDoc, deleteField, onSnapshot, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import Header from "@/components/Header";

export default function ItemDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // 商品情報の取得（リアルタイム監視に切り替え）
    const unsubItem = onSnapshot(doc(db, "items", id as string), (s) => {
      if (s.exists()) setItem({ id: s.id, ...s.data() });
    });

    const unsubAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        // 自分がいいねしているかチェック
        const unsubLike = onSnapshot(doc(db, "users", u.uid, "likes", id as string), (s) => {
          setIsLiked(s.exists());
        });
        return () => unsubLike();
      }
    });

    return () => { unsubItem(); unsubAuth(); };
  }, [id]);

  const toggleLike = async () => {
    if (!user) return alert("いいねするにはログインが必要です");
    const itemRef = doc(db, "items", id as string);
    const userLikeRef = doc(db, "users", user.uid, "likes", id as string);

    if (isLiked) {
      // いいね解除
      await deleteDoc(userLikeRef);
      await updateDoc(itemRef, { likeCount: increment(-1) });
    } else {
      // いいね登録
      await setDoc(userLikeRef, { createdAt: new Date() });
      await updateDoc(itemRef, { likeCount: increment(1) });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("この出品を削除してもよろしいですか？")) return;
    try {
      await deleteDoc(doc(db, "items", id as string));
      alert("削除しました");
      router.push("/");
    } catch (e) {
      alert("削除に失敗しました");
    }
  };

  if (!item) return <div className="p-10 text-center text-black">読み込み中...</div>;

  const isSeller = user?.uid === item.sellerId;

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      <Header />
      <div className="max-w-md mx-auto">
        <div className="relative aspect-square bg-gray-100">
          <img src={item.imageUrl} className="w-full h-full object-cover" />
          {item.isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-black text-4xl border-4 border-white p-4 -rotate-12">SOLD OUT</span>
            </div>
          )}
          {/* いいねボタン */}
          <button 
            onClick={toggleLike}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg flex items-center gap-2 active:scale-90 transition"
          >
            <span className={isLiked ? "text-red-500" : "text-gray-400"}>
              {isLiked ? "❤️" : "🤍"}
            </span>
            <span className="text-xs font-bold">{item.likeCount || 0}</span>
          </button>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
          <p className="text-3xl font-black text-red-600 mb-6">¥{item.price?.toLocaleString()}</p>
          
          <div className="bg-gray-50 p-4 rounded-2xl mb-8">
            <h2 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">商品説明</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          {isSeller ? (
            <div className="space-y-3">
              <Link href={`/items/${id}/edit`} className="block w-full bg-gray-800 text-white text-center font-bold py-4 rounded-2xl shadow-lg">
                商品の編集
              </Link>
              <button onClick={handleDelete} className="w-full bg-white text-red-600 border-2 border-red-50 font-bold py-4 rounded-2xl">
                この出品を削除する
              </button>
            </div>
          ) : (
            <Link 
              href={item.isSold ? "#" : `/items/${id}/buy`}
              className={`block w-full text-center font-bold py-4 rounded-2xl shadow-lg transition ${
                item.isSold ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 text-white active:scale-95"
              }`}
            >
              {item.isSold ? "売り切れました" : "購入手続きへ"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
