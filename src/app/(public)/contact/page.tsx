export default function ContactPage() {
  return (
    <section className="py-16 max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-extrabold text-dark font-sans mb-6 text-center">Contact Us</h1>
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <p className="text-gray-warm text-center mb-8">Have a question? We'd love to hear from you.</p>
        <form className="space-y-4">
          <input type="text" placeholder="Your name" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="email" placeholder="Your email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <textarea rows={5} placeholder="Your message" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"></textarea>
          <button type="submit" className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
