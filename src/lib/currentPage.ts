import type { Pages } from "../config/site-config";

// * these functions detect the current page of the site.
// they return the page type as a string.

const setSiteBodyAttribute = (hostname: string): void => {
  if (hostname === "cenele.com") {
    document.body.setAttribute("host", "cenel");
    console.log("cenele.com");
  } else {
    document.body.setAttribute("host", "kolnovel");
    console.log("kolbook.xyz");
  }
};

export function cenelDetectCurrentPage(): Pages {
  const hostname = window.location.hostname;
  setSiteBodyAttribute(hostname);

  const bodyClasses = document.body.classList;
  if (bodyClasses.contains("reading-manga")) {
    return "chapter";
  } else if (bodyClasses.contains("manga-page")) {
    return "page";
  } else if (
    bodyClasses.contains("page") &&
    !bodyClasses.contains("home") &&
    location.hash.includes("#user-library")
  ) {
    return "user-library";
  } else {
    return "home";
  }
}

export function kolnovelDetectCurrentPage(): Pages {
  const hostname = window.location.hostname;
  setSiteBodyAttribute(hostname);

  if (document.querySelector("article > div.bixbox.episodedl")) {
    return "chapter";
  } else if (document.querySelector("article > div.sertobig")) {
    return "page";
  } else if (location.hash.includes("#user-library")) {
    return "user-library";
  } else {
    return "home";
  }
}
