const fs = require('fs');

const code = `import { supabase } from '../lib/supabase'

async function getTopDishes() {
  const { data } = await supabase
    .from('dishes')
    .select('id, name, category, photo_url, avg_rating, total_reviews, restaurant_id, restaurants(name)')
    .eq('status', 'active')
    .order('weighted_score', { ascending: false })
    .limit(12)
  return data || []
}

export default async function Home() {
  const topDishes = await getTopDishes()
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-600">Foodoo</h1>
          <p className="text-sm text-gray-500">Pakistan ka dish rating platform</p>
        </div>
      </header>
      <section className="bg-green-600 text-white py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Order karne se pehle janiye</h2>
          <p className="text-green-100 mb-6">Real customers ki dish ratings</p>
          <form action="/search" method="GET" className="flex gap-2">
            <input name="q" type="text" placeholder="Dish ya restaurant dhundein..." className="flex-1 px-4 py-3 rounded-xl text-gray-800 outline-none" />
            <button type="submit" className="bg-white text-green-600 font-semibold px-6 py-3 rounded-xl">Search</button>
          </form>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Top Dishes in Lahore</h3>
        {topDishes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">Dishes abhi available nahi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {topDishes.map((dish) => (
              <a key={dish.id} href={"/dish/" + dish.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100">
                <div className="bg-gray-100 h-36 flex items-center justify-center">
                  {dish.photo_url ? <img src={dish.photo_url} alt={dish.name} className="w-full h-full object-cover" /> : <span className="text-4xl">Dish</span>}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-800 text-sm">{dish.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{dish.restaurants && dish.restaurants.name}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-bold">{dish.avg_rating ? dish.avg_rating.toFixed(1) : "New"}</span>
                    <span className="text-xs text-gray-400">({dish.total_reviews})</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      <footer className="text-center py-8 text-gray-400 text-sm border-t mt-10">
        <p>Foodoo 2024 - Pakistan ka dish discovery platform</p>
      </footer>
    </main>
  )
}`;

fs.writeFileSync('app/page.js', code);
console.log('Done! page.js written successfully.');