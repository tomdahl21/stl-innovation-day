// The current monthly feature. To ship a new campaign, change the `id` and
// the rest — the modal will re-trigger for every user who already dismissed
// the previous one (it's persisted by id, not by a boolean).

export type MonthlyCampaign = {
  id: string;
  eyebrow: string;
  welcome: string;
  title: string;
  body: string;
  ctaLabel: string;
  images: { url: string; alt: string }[];
};

export const CURRENT_CAMPAIGN: MonthlyCampaign = {
  id: "2026-05-toasted-ravioli",
  eyebrow: "This month on Trove",
  welcome: "Welcome back.",
  title: "The hunt for the best toasted ravioli.",
  body: "Born on the Hill, served everywhere — we sent locals across the metro to settle the question. New gems added all month long. The map is your guide.",
  ctaLabel: "Take me there",
  images: [
    { url: "/monthly/t-rav01.jpg", alt: "Toasted ravioli plate" },
    { url: "/monthly/t-rav02.jpg", alt: "Toasted ravioli close-up" },
    { url: "/monthly/t-rav03.jpg", alt: "Toasted ravioli served at a Hill restaurant" },
  ],
};
