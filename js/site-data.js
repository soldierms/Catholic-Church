// Pulls Events and Gallery content from Supabase for the public pages.
// If the database is unreachable (e.g. a paused free-tier project), the
// static "nothing here yet" fallback already in the markup stays visible -
// nothing here ever produces a broken page.
document.addEventListener("DOMContentLoaded", function () {
  if (typeof supabase === "undefined" || !window.SUPABASE_URL) return;
  var client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  function formatEventDate(dateStr, timeStr) {
    var parts = dateStr.split("-").map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    var label = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return timeStr ? label + " · " + timeStr : label;
  }

  var eventsList = document.getElementById("events-list");
  var eventsEmpty = document.getElementById("events-empty");
  if (eventsList) {
    client
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .then(function (result) {
        var rows = result.data;
        if (result.error || !rows || !rows.length) return;

        rows.forEach(function (event) {
          var card = document.createElement("div");
          card.className = "card";

          var pill = document.createElement("span");
          pill.className = "lang";
          pill.textContent =
            formatEventDate(event.event_date, event.event_time) +
            (event.location ? " · " + event.location : "");

          var title = document.createElement("h3");
          title.textContent = event.title;

          var description = document.createElement("p");
          description.textContent = event.description || "";

          card.appendChild(pill);
          card.appendChild(title);
          card.appendChild(description);
          eventsList.appendChild(card);
        });

        eventsList.hidden = false;
        if (eventsEmpty) eventsEmpty.hidden = true;
      });
  }

  var galleryGrid = document.getElementById("gallery-dynamic");
  var galleryEmpty = document.getElementById("gallery-empty");
  if (galleryGrid) {
    client
      .from("gallery_photos")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(function (result) {
        var rows = result.data;
        if (result.error || !rows || !rows.length) return;

        rows.forEach(function (photo) {
          var tile = document.createElement("div");
          tile.className = "gallery-item has-photo";

          var img = document.createElement("img");
          img.src = window.SUPABASE_URL + "/storage/v1/object/public/gallery/" + photo.image_path;
          img.alt = photo.caption || "";
          img.loading = "lazy";

          var caption = document.createElement("span");
          caption.textContent = photo.caption || "";

          tile.appendChild(img);
          tile.appendChild(caption);
          galleryGrid.appendChild(tile);
        });

        galleryGrid.hidden = false;
        if (galleryEmpty) galleryEmpty.hidden = true;
        if (window.GCCWireGalleryTiles) window.GCCWireGalleryTiles();
      });
  }
});
