<div id="coas" style="display:none">
  <div id="controls">
    <button id="generateCOA">New</button>
    <button id="downloadPNG">PNG</button>
    <button id="back">◄</button>
    <button id="archive">■</button>
    <button id="next" disabled>►</button>
  </div>

  <svg id="canvas" width="400" height="400" viewBox="0 0 200 200">
    <rect x=0 y=0 width="100%" height="100%" stroke="#000" fill="#fff"/>
    <rect x=0 y=0 width="100%" height="100%" fill="url(#gridSmall)"/>
    <rect x=0 y=0 width="100%" height="100%" fill="url(#grid)"/>
    <g id="form"></g>
    <g transform="translate(100, 100)">
      <g id="circles" fill="#000" stroke="#333" stroke-width=".5"></g>
      <g id="letters" style="font-family: monospace; text-anchor: middle; dominant-baseline: central; font-size: 4px" fill="#fff"></g>
    </g>
  </svg>
  <br><input id="x"><input id="y">
</div>

<style>
  #coas {
		width: 400px;
		display: inline-block;
	}
</style>