"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase/config";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import Header from "@/components/Header";

export default function ItemDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getDoc(doc(db, "items", id as string)).then(s => s.exists() && setItem({ id: s.id, ...s.data() }));
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, [id]);

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
        <div className="relative aspect-square">
          <img src={item.imageUrl} className="w-full h-full object-cover" />
          {item.isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-black text-4xl border-4 border-white p-4 -rotate-12">SOLD OUT</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
          <p className="text-3xl font-black text-red-600 mb-6">¥{item.price?.toLocaleString()}</p>
          
          <div className="bg-gray-50 p-4 rounded-2xl mb-8">
            <h2 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">商品説明</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          {isSeller ? (
            /* 出品者向けのメニュー */
            <div className="space-y-3">
              <Link 
                href={`/items/${id}/edit`} 
                className="block w-full bg-gray-800 text-white text-center font-bold py-4 rounded-2xl shadow-lg"
              >
                商品の編集
              </Link>
              <button 
                onClick={handleDelete}
                className="w-full bg-white text-red-600 border-2 border-red-50 font-bold py-4 rounded-2xl"
              >
                この出品を削除する
              </button>
            </div>
          ) : (
            /* 購入者向けのボタン */
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
