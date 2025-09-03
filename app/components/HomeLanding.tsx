"use client";
import { useEffect } from "react";

export default function HomeLanding() {
  useEffect(() => {
    const carousel = document.getElementById("package-carousel");
    const platinum = document.getElementById("platinum-card");
    if (carousel && platinum && window.innerWidth < 768) {
      const left = platinum.offsetLeft - carousel.offsetWidth / 2 + platinum.offsetWidth / 2;
      carousel.scrollTo({ left, behavior: "smooth" });
    }
  }, []);

  return (
    <main>
      <section
        className="relative text-white text-center"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/hero.jpg') no-repeat center center / cover" }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto pt-32 pb-20 px-4">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            Winning with Expert NBA Tips
            <img src="/nba-logo.svg" className="w-16 h-16 inline-block align-middle" alt="ESB Logo" />
          </h1>
          <p id="hero-text" className="text-l mb-8">
            Gain an unbeatable edge with our expert, data-driven basketball tips. We do the research, you collect the winnings.
          </p>

          <div className="relative container mx-auto gutters pb-16">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-2 lg:grid-cols-4">
              <div className="card p-6 stat-hover min-w-[160px] flex-1">
                <p id="win-rate" className="text-4xl stat-number text-success">78%</p>
                <p>Win Rate</p>
              </div>
              <div className="card p-6 stat-hover min-w-[160px] flex-1">
                <p id="average-roi" className="text-4xl stat-number text-primary">+25%</p>
                <p>Average ROI</p>
              </div>
              <div className="card p-6 stat-hover min-w-[160px] flex-1">
                <p id="win-streak" className="text-4xl stat-number text-accent">12</p>
                <p>Win Streak</p>
              </div>
              <div className="card p-6 stat-hover min-w-[160px] flex-1">
                <p id="active-members" className="text-4xl stat-number">1,200+</p>
                <p>Members</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <a href="#packages" className="w-full md:w-auto btn-primary text-black font-extrabold text-xl md:text-3xl py-5 px-10 rounded-xl text-center">
              Get Winning Tips
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-spacing container mx-auto gutters text-center">
        <h2 className="text-3xl font-bold mb-2">HOW IT WORKS</h2>
        <p className="text-gray-400 mb-4">Get Verified Picks. Guaranteed Credits. Built for Bettors Who Take It Seriously.</p>
        <h3 className="text-primary font-semibold mb-8">3 EASY STEPS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="bg-primary text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Register an account</h3>
          </div>
          <div>
            <div className="bg-primary text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Choose your package</h3>
            <p>Pick a package that is right for you.</p>
          </div>
          <div>
            <div className="bg-primary text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Unlock your picks and start winning</h3>
            <p>Use your picks and bet with your bookie.</p>
          </div>
        </div>
      </section>

      <section id="packages" className="section-spacing container mx-auto gutters">
        <h2 className="text-3xl font-bold text-center mb-2">Choose Your Path to Victory</h2>
        <p className="text-center mb-8">First time customer? Try our standard trade. Looking to get more out of Elite Sports Bets? Go Gold!</p>
        <div id="package-carousel" className="flex flex-row gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-x-visible md:snap-none">
          <div className="card pricing-card bronze p-6 flex flex-col min-w-[260px] snap-start">
            <h3 className="text-xl font-bold">Bronze</h3>
            <p className="text-4xl font-bold my-4 price">$120</p>
            <p className="dark:text-gray-400 text-gray-300">Five (5) GUARANTEED individual sports trade credits.</p>
            <a href="/signup" className="mt-auto w-full text-center btn-primary text-black font-bold py-2 px-4 rounded-lg mt-6">Choose</a>
          </div>
          <div className="card pricing-card silver p-6 flex flex-col min-w-[260px] snap-start">
            <h3 className="text-xl font-bold">Silver</h3>
            <p className="text-4xl font-bold my-4 price">$300</p>
            <p className="dark:text-gray-400 text-gray-300">Fifteen (15) GUARANTEED individual sports trade credits.</p>
            <a href="/signup" className="mt-auto w-full text-center btn-primary text-black font-bold py-2 px-4 rounded-lg mt-6">Choose</a>
          </div>
          <div className="card pricing-card gold p-6 flex flex-col min-w-[260px] snap-start">
            <h3 className="text-xl font-bold">Gold</h3>
            <p className="text-4xl font-bold my-4 price">$550</p>
            <p className="dark:text-gray-400 text-gray-300">Thirty (30) GUARANTEED individual sports trade credits.</p>
            <a href="/signup" className="mt-auto w-full text-center btn-primary text-black font-bold py-2 px-4 rounded-lg mt-6">Choose</a>
          </div>
          <div
            id="platinum-card"
            className="card pricing-card standard platinum p-8 flex flex-col ring-2 ring-accent border-accent shadow-2xl relative md:scale-105 z-10 min-w-[260px] snap-center"
            style={{ background: "linear-gradient(135deg, #3B82F6 0%, #FFCD1C 100%)", color: "#fff" }}
          >
            <span className="best-value-badge">Best Value</span>
            <h3 className="text-xl font-bold flex items-center gap-2">Platinum <span className="text-3xl text-yellow-400">👑</span></h3>
            <p className="text-4xl font-bold text-white my-4 price">$1100</p>
            <p className="text-dark">Unlimited monthly picks including live (in-play) and futures trades.</p>
            <p className="text-dark">A senior trader is assigned to you and acts as your VIP concierge.</p>
            <a href="/signup" className="mt-auto w-full text-center bg-accent text-white font-bold py-2 px-4 rounded-lg mt-6 platinum-btn">Choose</a>
          </div>
        </div>
        <p className="text-center text-sm dark:text-gray-500 mt-6">
          <b>GUARANTEED</b> = if the pick does not win, you will receive another credit until you win. This means that you will only be deducted a credit if the pick you unlock wins. If the pick we provide is incorrect, you will receive another credit until you unlock a winning pick. Please note: This does not guarantee a profit.
        </p>
      </section>

      <section className="section-spacing container mx-auto gutters">
        <h2 className="text-3xl font-bold text-center mb-2">What Our Members Say</h2>
        <p className="text-center text-yellow-400 mb-8">★★★★☆ 4.8/5 from 1,200+ members</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6">
            <p className="mb-4">&quot;Up 40% this season thanks to ESB. The analysis is spot-on and the community is incredibly supportive.&quot;</p>
            <div className="flex items-center"><p className="font-bold">Mike Johnson</p><p className="text-sm ml-2">Member since 2023</p></div>
          </div>
          <div className="card p-6">
            <p className="mb-4">&quot;Best investment I&#39;ve made. The tips are consistent and the ROI tracking helps me stay disciplined.&quot;</p>
            <div className="flex items-center"><p className="font-bold">Sarah Davis</p><p className="text-sm ml-2">Member since 2022</p></div>
          </div>
          <div className="card p-6">
            <p className="mb-4">&quot;Finally found a service that delivers. Transparent results and expert analysis make all the difference.&quot;</p>
            <div className="flex items-center"><p className="font-bold">Alex Rodriguez</p><p className="text-sm ml-2">Member since 2023</p></div>
          </div>
        </div>
      </section>

      <section className="section-spacing container mx-auto gutters">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose ESB</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="card p-6 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-2xl">👔</span>
              <h3 className="text-xl font-semibold">Elite Expertise</h3>
            </div>
            <p>We only work with the best. Our traders live and breathe sports, having achieved success unmatched in the betting industry. Every team member is rigorously vetted for excellence.</p>
          </div>
          <div className="card p-6 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-2xl">🕸️</span>
              <h3 className="text-xl font-semibold">Syndicate Access</h3>
            </div>
            <p>We&#39;re connected to the most powerful syndicates of information in the world and use cutting-edge tech to deliver elite insights directly to our members.</p>
          </div>
          <div className="card p-6 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-2xl">📈</span>
              <h3 className="text-xl font-semibold">Comprehensive Data</h3>
            </div>
            <p>Our picks integrate all available data: advanced statistical models, live stadium news, injury updates, referee assignments, and even weather conditions.</p>
          </div>
          <div className="card p-6 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-2xl">🪙</span>
              <h3 className="text-xl font-semibold">Skin in the Game</h3>
            </div>
            <p>Every pick we offer is personally backed by our traders. We&#39;re not just recommending bets—we&#39;re placing them ourselves. Our success is your success.</p>
          </div>
        </div>
      </section>

      <div className="bg-primary rounded-lg text-center p-12 container mx-auto gutters">
        <h2 className="text-3xl font-bold text-black mb-4">Ready to Start Winning?</h2>
        <p className="text-black mb-8">Join 1,200+ successful bettors and turn your basketball knowledge into profit.</p>
        <a href="/signup" className="bg-white text-black font-bold py-3 px-8 rounded-lg">Get Started Today</a>
      </div>

      <section className="section-spacing container mx-auto gutters max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-8">FREQUENTLY ASKED QUESTIONS</h2>
        <div className="space-y-4">
          <details className="faq-item card p-4">
            <summary className="font-semibold">What does ESB actually do?</summary>
            <p className="mt-2">We are a sports betting consultant business. Our purpose is to help our members to become sharp bettors who consistently profit on sports betting. We provide industry leading Premium picks built on superior knowledge and experience that we back ourselves. NO other handicapping service offers this.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">What is a &apos;pick&apos;?</summary>
            <p className="mt-2">A pick is a recommendation that we provide for you to use in placing a sports bet. A pick is synonymous with the words &apos;play&apos;, &apos;tip&apos;, &apos;bet&apos; and &apos;trade&apos; in the context of sports betting.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">What benefits do I receive as an ESB member?</summary>
            <p className="mt-2">Membership is entirely free. Once you register an ESB account, you will gain access to our weekly newsletter, betting articles as well as receive weekly Premium industry leading picks for free.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">How do I receive my picks?</summary>
            <p className="mt-2">To receive a pick, you must log into your account and UNLOCK the pick that you are interested in by using your CREDITS. Each pick is worth one (1) credit. Alternatively, you can have your picks emailed to you or sent via SMS text message.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">Which Membership option should I choose?</summary>
            <p className="mt-2">This is commensurate to how much sports betting you partake. If you trade often, then the Silver or Gold packages will be most suitable. If you seek to lock in a profit and approach sports betting as an investment or income-generating venture, the Platinum membership is ideal.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">How does the Platinum membership work?</summary>
            <p className="mt-2">The Platinum membership is suited to members who are serious about using sports betting to develop short term and long-term wealth. You will unlock the true power of Elite Sports Bets using this membership and will quickly see your bankroll grow. As a Platinum member, you will have a personal senior trader and VIP client manager who will take full control of all your sports betting so that you won&apos;t have to lift a finger. Please email vip@elitesportsbets.com for further information.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">When do I receive my picks?</summary>
            <p className="mt-2">Our dominance of the industry relies on the rigorousness and thorough work ethic we boast. We are highly detail oriented and incorporate all relevant and pertinent data into our picks, which are then published at least 2 hours prior to the starting time of the event.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">Does ESB guarantee a Profit?</summary>
            <p className="mt-2">ESB guarantees a profit only to our Platinum members.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">Can I cancel my membership?</summary>
            <p className="mt-2">Yes. You can downgrade, upgrade or cancel your service at any time from your account page. When you cancel, you will receive a refund in proportion to the usage of your account calculated on a pro-rata basis. Please refer to our Refund policy in the ESB Terms and Conditions.</p>
          </details>
          <details className="faq-item card p-4">
            <summary className="font-semibold">What is a GUARANTEED pick?</summary>
            <p className="mt-2">A guaranteed pick means that you will not be charged a credit unless the pick you unlock wins. If the pick you unlock loses, you will receive another credit until you unlock a winning pick. Only then will your credits be redeemed. Please note that a GUARANTEED pick does not guarantee a profit.</p>
          </details>
        </div>
      </section>

      {/* Contact Modal (optional trigger) */}
      <div id="contactModal" className="modal">
        <div className="modal-content card relative">
          <button className="close-button" onClick={() => {
            const el = document.getElementById('contactModal');
            if (el) el.style.display = 'none';
          }}>&times;</button>
          <h2 className="text-2xl font-bold text-center mb-2">CONTACT US</h2>
          <p className="text-center text-primary mb-2">LETS TALK ABOUT IT</p>
          <p className="text-center mb-6">Get started on the path to quality trades. Contact us for more information on how we can deliver on our promise.</p>
          <form action="#" method="POST">
            <div className="space-y-4">
              <input type="text" name="name" placeholder="Name" className="w-full p-3 form-field" />
              <input type="email" name="email" placeholder="Email" className="w-full p-3 form-field" />
              <input type="text" name="subject" placeholder="Subject" className="w-full p-3 form-field" />
              <textarea name="message" rows={4} placeholder="Message" className="w-full p-3 form-field" />
              <button type="submit" className="w-full btn-primary text-white font-bold py-3 rounded-lg">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}


