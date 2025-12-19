"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function BuyConfirm() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "items", id)).then(s => s.exists() && setItem({ id: s.id, ...s.data() }));
  }, [id]);

  const handleBuy = async () => {
    if (!user || !item) return;
    setLoading(true);
    try {
      // 1. 商品を売り切れ状態に更新
      await updateDoc(doc(db, "items", id), {
        status: "sold", // 以前のコードと合わせるため status を使用
        isSold: true,
        buyerId: user.uid,
        soldAt: serverTimestamp(),
      });

      // 2. チャットルームの初期データを作成
      await setDoc(doc(db, "chats", id), {
        itemId: id,
        itemName: item.name,
        sellerId: item.sellerId,
        buyerId: user.uid,
        updatedAt: serverTimestamp(),
        lastMessage: "購入されました！"
      }, { merge: true });

      alert("購入が完了しました！取引チャットへ移動します。");

      // ★ここを修正：メインではなくチャット画面へ飛ばす
      router.push(`/chat/${id}`);

    } catch (error: any) {
      console.error(error);
      alert("購入に失敗しました: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <div className="p-10 text-center text-black">読み込み中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <div className="bg-white p-4 border-b flex items-center">
        <button onClick={() => router.back()} className="text-xl mr-4">←</button>
        <h1 className="font-bold">購入内容の確認</h1>
      </div>

      <div className="p-4 bg-white mb-2 flex gap-4">
        <img src={item.imageUrl} className="w-20 h-20 object-cover rounded" alt="" />
        <div>
          <p className="font-bold text-sm">{item.name}</p>
          <p className="font-bold text-lg">¥{Number(item.price).toLocaleString()}</p>
        </div>
      </div>

      <div className="p-4 bg-white border-y mb-8">
        <div className="flex justify-between py-2">
          <span className="text-gray-500">支払い金額</span>
          <span className="font-bold text-red-600 text-xl">¥{Number(item.price).toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={handleBuy}
          disabled={loading || item.isSold}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-lg shadow-lg active:scale-95 transition disabled:bg-gray-300"
        >
          {loading ? "処理中..." : "購入を確定する"}
        </button>
      </div>
    </main>
  );
}
