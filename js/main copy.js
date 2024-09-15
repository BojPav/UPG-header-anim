gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin);

/* 
There's only one <path> but it has a bunch of individual, disconnected segments ("M" commands)
so we'll use the helper function to split that into a bunch of <path> elements so that the browser
can render the stroke progressively in a correct manner.
*/

var tl_intro = gsap.timeline({ })

.to(".bgnd", { opacity: 1, duration: 2 })
.to(".bgnd", { opacity: 0, duration: 2 })

.to(".abu-dabhi", { opacity: 1, duration: 2 }, "-=2")
.to(".abu-dabhi", { opacity: 0, duration: 2, delay: 1 })

.to(".first_bgnd", { opacity: 1, duration: 2 }, "-=2")
.to(".first_bgnd", { opacity: 0, duration: 2, delay: 1 })

.to(".second_bgnd", { opacity: 1, duration: 2 }, "-=2")
//.to(".second_bgnd", { opacity: 0, duration: 2 })

let paths = splitPaths("#st1");
// to animate all the segments at once...
gsap.from(paths, { drawSVG: 0, duration: 5 });

// but instead, let's animate each segment one-after-the-other and make sure there's a consistent speed.
let duration = 5,
    distance = 0,
    tl = gsap.timeline({delay: 1});
paths.forEach(segment => distance += segment.getTotalLength());
paths.forEach(segment => {
  tl.from(segment, {
    drawSVG: 0,
    ease: "none",
    duration: duration * (segment.getTotalLength() / distance)
  });
});

// helper function that busts apart a single <path> that has multiple segments into a <path> for each segment (indicated by an "M" command);
function splitPaths(paths) {
  let toSplit = gsap.utils.toArray(paths),
      newPaths = [];
  if (toSplit.length > 1) {
    toSplit.forEach(path => newPaths.push(...splitPaths(path)));
  } else {
    let path = toSplit[0],
        rawPath = MotionPathPlugin.getRawPath(path),
        parent = path.parentNode,
        attributes = [].slice.call(path.attributes);
    newPaths = rawPath.map(segment => {
      let newPath = document.createElementNS("http://www.w3.org/2000/svg", "path"),
          i = attributes.length;
      while (i--) {
        newPath.setAttributeNS(null, attributes[i].nodeName, attributes[i].nodeValue);
      }
      newPath.setAttributeNS(null, "d", "M" + segment[0] + "," + segment[1] + "C" + segment.slice(2).join(",") + (segment.closed ? "z" : ""));
      parent.insertBefore(newPath, path);
      return newPath;
    });
    parent.removeChild(path);
  }
  return newPaths;
}