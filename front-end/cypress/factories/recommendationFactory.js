import axios from "axios";
let coreFetch;
if (typeof window === "undefined") {
  coreFetch = axios;
}


const playlists= [
  {
    name: "most-viewed",
    id: "PL15B1E77BB5708555",
    max: 543,
  },
  {
    name: "billboard",
    id: "PL55713C70BA91BD6E",
    max: 200,
  },
  {
    name: "latest",
    id: "PLFgquLnL59akA2PflFpeQG9L01VFg90wS",
    max: 100,
  },
  {
    name: "popular-music-videos",
    id: "PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI",
    max: 200,
  },
  {
    name: "top-hits-this-week",
    id: "PLw-VjHDlEOgvWPpRBs9FRGgJcKpDimTqf",
    max: 130,
  },
];

const app = {
  playlist: {},
  index: null,
  baseURL: `https://www.youtube.com/embed/?list={0}&index={1}`,
  queryStrings:
    "&amp;t=15&amp;wmode=transparent&amp;autoplay=1&amp;rel=0&amp;showinfo=0&amp;iv_load_policy=3&amp;showsearch=0&amp;autohide=1&amp;controls=1&amp;wadsworth=1",
  iframeSrc: "",
};


function generateRandom(num) {
  return Math.floor(Math.random() * num);
}

function getPlaylist() {
  const loc = generateRandom(playlists.length);
  return playlists[loc];
}

function getEmbedMusicVideoUrl() {
  const playlist = getPlaylist();
  const index =  generateRandom(playlist.max);
 
  return app.baseURL.replace("{0}",playlist.id).replace("{1}",index.toString()) + app.queryStrings;
  

}

async function getMainSiteYoutubeMusicVideoUrl(embedUrl) {
  if (embedUrl == null) {
    throw new Error("embedUrl is null");
  }
  const res = await coreFetch(embedUrl);
  const txt = await res.data;

  const realUrlStartIdx = txt.indexOf("https://www.youtube.com/watch?v=");
  if (realUrlStartIdx === -1) {
    return embedUrl;
  }

  const realUrlEndIdx = txt.indexOf('"', realUrlStartIdx);
  if (realUrlEndIdx === -1) {
    return embedUrl;
  }

  return txt.substring(realUrlStartIdx, realUrlEndIdx);
}

export async function getRandomMusicVideoUrl(preventEmbedded) {

  let numTriesForNonEmbed = 15;
  let youtubeLink = "";
  let containsEmbed = false;

  while (numTriesForNonEmbed > 0) {
    numTriesForNonEmbed--;

    let embedUrl = getEmbedMusicVideoUrl();
    youtubeLink = await getMainSiteYoutubeMusicVideoUrl(embedUrl);
    containsEmbed =
      youtubeLink.indexOf("https://www.youtube.com/embed/?list=") !== -1;
    if (!containsEmbed) {
      return youtubeLink;
    }
  }

  if (preventEmbedded && containsEmbed) {
  
    return null;
  }
   
  return youtubeLink;
}


export async function getRandomNameMusicYtb(youtubeLink){
 
  const response= await axios.get(youtubeLink)
  const nome = await response.data.split("title>")[1].slice(0,-2);

  return nome;
}

export async function createRecommendationData(){
  const youtubeLink = await getRandomMusicVideoUrl(true);
  const name = getRandomNameMusicYtb(youtubeLink)
  return {
      name,
      youtubeLink,
  }
}

