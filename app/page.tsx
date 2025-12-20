"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase/config";
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userLikes, setUserLikes] = useState<string[]>([]);

  useEffect(() => {
    // 1. 商品一覧のリアルタイム取得
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsubItems = onSnapshot(q, (s) => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    // 2. ログイン状態と自分のいいねリストの取得
    const unsubAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        const unsubLikes = onSnapshot(collection(db, "users", u.uid, "likes"), (s) => {
          setUserLikes(s.docs.map(d => d.id));
        });
        return () => unsubLikes();
      } else {
        setUserLikes([]);
      }
    });

    return () => { unsubItems(); unsubAuth(); };
  }, []);

  // いいね処理
  const toggleLike = async (e: React.MouseEvent, itemId: string, currentIsLiked: boolean) => {
    e.preventDefault(); // 親要素のLinkへの遷移を防止
    if (!user) return alert("いいねするにはログインが必要です");

    const itemRef = doc(db, "items", itemId);
    const userLikeRef = doc(db, "users", user.uid, "likes", itemId);

    if (currentIsLiked) {
      await deleteDoc(userLikeRef);
      await updateDoc(itemRef, { likeCount: increment(-1) });
    } else {
      await setDoc(userLikeRef, { createdAt: new Date() });
      await updateDoc(itemRef, { likeCount: increment(1) });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-black">
      <Header />
      
      <main className="p-4 grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        {items.map((item) => {
          const isLiked = userLikes.includes(item.id);
          return (
            <div key={item.id} className="relative">
              <Link href={`/items/${item.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 block h-full">
                <div className="aspect-square bg-gray-200 relative">
                  <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                  {item.isSold && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-md">SOLD</div>
                  )}
                </div>
                <div className="p-2 pb-10"> {/* 下部にボタン用の余白 */}
                  <p className="text-xs text-gray-500 truncate">{item.name}</p>
                  <p className="font-bold text-sm">¥{item.price?.toLocaleString()}</p>
                </div>
              </Link>
              
              {/* 商品一覧上のいいねボタン */}
              <button 
                onClick={(e) => toggleLike(e, item.id, isLiked)}
                className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-100 shadow-sm active:scale-90 transition"
              >
                <span className={isLiked ? "text-red-500" : "text-gray-300 text-xs"}>
                  {isLiked ? "❤️" : "🤍"}
                </span>
                <span className="text-[10px] font-bold text-gray-500">{item.likeCount || 0}</span>
              </button>
            </div>
          );
        })}
      </main>

      <Link href="/upload" className="fixed bottom-6 right-6 bg-red-600 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl font-bold text-[10px] active:scale-90 transition-transform">
        <span className="text-2xl mb-[-4px]">📸</span>
        出品
      </Link>
    </div>
  );
}
