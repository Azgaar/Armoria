<div id="menu" style="display:none">
  <fieldset id="options">
    <legend>Options</legend>

    <label title="Grid size for elements dragging. Set to 0 to disable dragging">Grid size
      <input id="gridSize" type="number" max="25" min="0" step="1" value="10"/><br>
    </label>

    <input type="checkbox" id="allowDrag"/>
    <label for="allowDrag">Allow drag</label>

  </fieldset>

  <fieldset>
    <legend>Shield</legend>

    <select id="shieldSelect">
      <option value="heater">Heater</option>
      <option value="oldFrench">Old French</option>
      <option value="spanish">Spanish</option>
      <option value="french">French</option>
      <option value="swiss">Swiss</option>
      <option value="wedged">Wedged</option>
      <option value="italian">Italian</option>
      <option value="kite">Kite</option>
      <option value="renaissance">Renaissance</option>
      <option value="baroque">Baroque</option>
      <option value="polish">Polish</option>
      <option value="german">German</option>
      <option value="lozenge">Lozenge</option>
      <option value="round">Round</option>
      <option value="vesicaPiscis">Vesica Piscis</option>
      <option value="square">Square</option>
      <option value="flag">Flag</option>
      <option value="pennon">Pennon</option>
      <option value="guidon">Guidon</option>
      <option value="banner">Banner</option>
      <option value="dovetail">Dovetail</option>
      <option value="gonfalon">Gonfalon</option>
      <option value="pennant">Pennant</option>
    </select>

    <select id="gradientSelect">
      <option value="grad1">Grad1</option>
      <option value="grad2">Grad2</option>
      <option value="grad3">Grad3</option>
    </select>
  </fieldset>

  <fieldset>
  <legend>Field</legend>

    <select id="shieldField">
      <option value="tincture">Tincture</option>
      <option value="pattern">Pattern</option>
      <option value="semy">Semy</option>
    </select>

    <select id="shieldPattern" style="display:none">
      <option value="vair">vair</option>
      <option value="vairInPale">vairInPale</option>
      <option value="vairEnPointe">vairEnPointe</option>
      <option value="ermine">ermine</option>
      <option value="chequy">chequy</option>
      <option value="lozengy">lozengy</option>
      <option value="fusily">fusily</option>
      <option value="pally">pally</option>
      <option value="barry">barry</option>
      <option value="gemelles">gemelles</option>
      <option value="bendy">bendy</option>
      <option value="bendySinister">bendySinister</option>
      <option value="palyBendy">palyBendy</option>
      <option value="pappellony">pappellony</option>
      <option value="masoned">masoned</option>
      <option value="fretty">fretty</option>
    </select>

    <select id="shieldSemy" style="display:none">
      <option value="lozenge">lozenge</option>
      <option value="fusil">fusil</option>
      <option value="mascle">mascle</option>
      <option value="rustre">rustre</option>
      <option value="lozengeFaceted">lozengeFaceted</option>
      <option value="lozengePloye">lozengePloye</option>
      <option value="roundel">roundel</option>
      <option value="annulet">annulet</option>
      <option value="mullet">mullet</option>
      <option value="mulletPierced">mulletPierced</option>
      <option value="mulletFaceted">mulletFaceted</option>
      <option value="mullet4">mullet4</option>
      <option value="mullet6">mullet6</option>
      <option value="mullet6Pierced">mullet6Pierced</option>
      <option value="mullet6Faceted">mullet6Faceted</option>
      <option value="mullet7">mullet7</option>
      <option value="mullet8">mullet8</option>
      <option value="mullet10">mullet10</option>
      <option value="estoile">estoile</option>
      <option value="sun">sun</option>
      <option value="fleurDeLis">fleurDeLis</option>
      <option value="crescent">crescent</option>
      <option value="delf">delf</option>
      <option value="billet">billet</option>
      <option value="triangle">triangle</option>
      <option value="trianglePierced">trianglePierced</option>
      <option value="goutte">goutte</option>
      <option value="heart">heart</option>
      <option value="pique">pique</option>
      <option value="trefle">trefle</option>
      <option value="сarreau">сarreau</option>
      <option value="crossHummetty">Сross Hummetty</option>
      <option value="crossVoided">Сross Voided</option>
      <option value="crossPattee">Сross Pattee</option>
      <option value="crossPotent">Сross Potent</option>
      <option value="crossCrosslet">Сross Сrosslet</option>
      <option value="crossClechy">Сross Clechy</option>
      <option value="crossBottony">Сross Bottony</option>
      <option value="crossFleury">Сross Fleury</option>
      <option value="crossPatonce">Сross Patonce</option>
      <option value="crossPommy">Сross Pommy</option>
      <option value="crossGamma">Сross Gamma</option>
      <option value="crossArrowed">Сross Barby</option>
      <option value="crossFitchy">Сross Fitchy</option>
      <option value="crossCercelee">Сross Cercelee</option>
      <option value="crossMoline">Сross Moline</option>
      <option value="crossFourchy">Сross Fourchy</option>
      <option value="crossAvellane">Сross Avellane</option>
      <option value="crossErminee">Сross Erminee</option>
      <option value="crossMaltese">Сross Maltese</option>
      <option value="crossCeltic">Сross Celtic</option>
      <option value="crossOccitan">Сross Occitan</option>
      <option value="crossSaltire">Сross Saltire</option>
      <option value="crossTau">Сross Tau</option>
      <option value="cinquefoil">Сinquefoil</option>
      <option value="lionRampant">Lion Rampant</option>
      <option value="lionPassant">Lion Passant</option>
      <option value="wolfPassant">Wolf Passant</option>
      <option value="greyhoundСourant">Greyhound Сourant</option>
      <option value="boarRampant">Boar Rampant</option>
      <option value="horseRampant">Horse Rampant</option>
      <option value="horseSalient">Horse Salient</option>
      <option value="bullPassant">Bull Passant</option>
      <option value="bullHeadCaboshed">Bull Head Caboshed</option>
      <option value="deerHeadCaboshed">Deer Head Caboshed</option>
      <option value="serpent">Serpent</option>
      <option value="eagle">Eagle</option>
      <option value="raven">Raven</option>
      <option value="cock">Cock</option>
      <option value="parrot">Parrot</option>
      <option value="swan">Swan</option>
      <option value="swanErased">Swan Erased</option>
      <option value="heron">Heron</option>
      <option value="dragonPassant">Dragon Passant</option>
      <option value="wyvern">Wyvern</option>
      <option value="griffinRampant">Griffin Rampant</option>
      <option value="griffinPassant">Griffin Passant</option>
      <option value="eagleTwoHeards">Eagle with Two Heads</option>
      <option value="unicornRampant">Unicorn Rampant</option>
      <option value="pegasus">Pegasus</option>
      <option value="escallop">Escallop</option>
      <option value="pike">Pike</option>
      <option value="cancer">Cancer</option>
      <option value="sword">Sword</option>
      <option value="hatchet">Hatchet</option>
      <option value="lochaberAxe">Lochaber Axe</option>
      <option value="mallet">Mallet</option>
      <option value="hand">Hand</option>
      <option value="crown">Crown</option>
      <option value="key">Key</option>
      <option value="buckle">Buckle</option>
      <option value="bugleHorn">Bugle Horn</option>
      <option value="horseshoe">Horseshoe</option>
      <option value="stagsAttires">Stag's Attires</option>
      <option value="cowHorns">Cow's Horns</option>
      <option value="wing">Wing</option>
      <option value="wingSword">Wing with Sword</option>
      <option value="lute">Lute</option>
      <option value="harp">Harp</option>
      <option value="wheel">Wheel</option>
      <option value="boat">Boat</option>
    </select>

    <select id="shieldTincture1Select">
      <option value="argent">Argent</option>
      <option value="or" selected>Or</option>
      <option value="gules">Gules</option>
      <option value="sable">Sable</option>
      <option value="azure">Azure</option>
      <option value="vert">Vert</option>
      <option value="purpure">Purpure</option>
    </select>

    <select id="shieldTincture2Select" style="display:none">
      <option value="argent">Argent</option>
      <option value="or">Or</option>
      <option value="gules" selected>Gules</option>
      <option value="sable">Sable</option>
      <option value="azure">Azure</option>
      <option value="vert">Vert</option>
      <option value="purpure">Purpure</option>
    </select>

    <select id="shieldPatternSize" style="display:none">
      <option value="big">big</option>
      <option value="standard" selected>standard</option>
      <option value="small">small</option>
      <option value="smaller">smaller</option>
      <option value="smallest">smallest</option>
    </select>

  </fieldset>

  <fieldset>
    <legend>Division</legend>
    <select id="divisionSelect">
      <option value="no">No</option>
      <option value="perPale">Per Pale</option>
      <option value="perFess">Per Fess</option>
      <option value="perBend">Per Bend</option>
      <option value="perBendSinister">Per Bend Sinister</option>
      <option value="perCross">Per Cross</option>
      <option value="perChevron">Per Chevron</option>
      <option value="perChevronReversed">Per Chevron Reversed</option>
      <option value="perPile">Per Pile</option>
      <option value="perSaltire">Per Saltire</option>
      <option value="gyronny">Gyronny</option>
      <option value="chevronny">Chevronny</option>
    </select>

    <select id="divisionLineSelect">
      <option value="straight">straight</option>
      <option value="wavy">wavy</option>
      <option value="engrailed">engrailed</option>
      <option value="invecked">invecked</option>
      <option value="embattled">embattled</option>
      <option value="raguly">raguly</option>
      <option value="urdy">urdy</option>
      <option value="dancetty">dancetty</option>
      <option value="indented">indented</option>
      <option value="dentilly">dentilly</option>
      <option value="bevilled">bevilled</option>
      <option value="angled">angled</option>
      <option value="flechy">flechy</option>
      <option value="barby">barby</option>
      <option value="enclavy">enclavy</option>
      <option value="escartely">escartely</option>
      <option value="arched">arched</option>
      <option value="archedReversed">archedReversed</option>
      <option value="nowy">nowy</option>
      <option value="nowyReversed">nowyReversed</option>
      <option value="embattledGhibellin">embattledGhibellin</option>
      <option value="embattledNotched">embattledNotched</option>
      <option value="embattledGrady">embattledGrady</option>
      <option value="dovetailedIntented">dovetailedIntented</option>
      <option value="dovetailed">dovetailed</option>
      <option value="potenty">potenty</option>
      <option value="potentyDexter">potentyDexter</option>
      <option value="potentySinister">potentySinister</option>
      <option value="rayonne">rayonne</option>
      <option value="nebuly">nebuly</option>
      <option value="seaWaves">seaWaves</option>
      <option value="dragonTeeth">dragonTeeth</option>
      <option value="firTrees">firTrees</option>
    </select>

    <select id="divisionField">
      <option value="tincture">Tincture</option>
      <option value="pattern">Pattern</option>
      <option value="semy">Semy</option>
    </select>

    <select id="divisionPattern" style="display:none">
      <option value="vair">vair</option>
      <option value="vairInPale">vairInPale</option>
      <option value="vairEnPointe">vairEnPointe</option>
      <option value="ermine">ermine</option>
      <option value="chequy">chequy</option>
      <option value="lozengy">lozengy</option>
      <option value="fusily">fusily</option>
      <option value="pally">pally</option>
      <option value="barry">barry</option>
      <option value="gemelles">gemelles</option>
      <option value="bendy">bendy</option>
      <option value="bendySinister">bendySinister</option>
      <option value="palyBendy">palyBendy</option>
      <option value="pappellony">pappellony</option>
      <option value="masoned">masoned</option>
      <option value="fretty">fretty</option>
    </select>

    <select id="divisionSemy" style="display:none">
      <option value="lozenge">lozenge</option>
      <option value="fusil">fusil</option>
      <option value="mascle">mascle</option>
      <option value="rustre">rustre</option>
      <option value="lozengeFaceted">lozengeFaceted</option>
      <option value="lozengePloye">lozengePloye</option>
      <option value="roundel">roundel</option>
      <option value="annulet">annulet</option>
      <option value="mullet">mullet</option>
      <option value="mulletPierced">mulletPierced</option>
      <option value="mulletFaceted">mulletFaceted</option>
      <option value="mullet4">mullet4</option>
      <option value="mullet6">mullet6</option>
      <option value="mullet6Pierced">mullet6Pierced</option>
      <option value="mullet6Faceted">mullet6Faceted</option>
      <option value="mullet7">mullet7</option>
      <option value="mullet8">mullet8</option>
      <option value="mullet10">mullet10</option>
      <option value="estoile">estoile</option>
      <option value="sun">sun</option>
      <option value="fleurDeLis">fleurDeLis</option>
      <option value="crescent">crescent</option>
      <option value="delf">delf</option>
      <option value="billet">billet</option>
      <option value="triangle">triangle</option>
      <option value="trianglePierced">trianglePierced</option>
      <option value="goutte">goutte</option>
      <option value="heart">heart</option>
      <option value="pique">pique</option>
      <option value="trefle">trefle</option>
      <option value="сarreau">сarreau</option>
      <option value="crossHummetty">Сross Hummetty</option>
      <option value="crossVoided">Сross Voided</option>
      <option value="crossPattee">Сross Pattee</option>
      <option value="crossPotent">Сross Potent</option>
      <option value="crossCrosslet">Сross Сrosslet</option>
      <option value="crossClechy">Сross Clechy</option>
      <option value="crossBottony">Сross Bottony</option>
      <option value="crossFleury">Сross Fleury</option>
      <option value="crossPatonce">Сross Patonce</option>
      <option value="crossPommy">Сross Pommy</option>
      <option value="crossGamma">Сross Gamma</option>
      <option value="crossArrowed">Сross Barby</option>
      <option value="crossFitchy">Сross Fitchy</option>
      <option value="crossCercelee">Сross Cercelee</option>
      <option value="crossMoline">Сross Moline</option>
      <option value="crossFourchy">Сross Fourchy</option>
      <option value="crossAvellane">Сross Avellane</option>
      <option value="crossErminee">Сross Erminee</option>
      <option value="crossMaltese">Сross Maltese</option>
      <option value="crossCeltic">Сross Celtic</option>
      <option value="crossOccitan">Сross Occitan</option>
      <option value="crossSaltire">Сross Saltire</option>
      <option value="crossTau">Сross Tau</option>
      <option value="cinquefoil">Сinquefoil</option>
      <option value="rose">Rose</option>
      <option value="lionRampant">Lion Rampant</option>
      <option value="lionPassant">Lion Passant</option>
      <option value="wolfPassant">Wolf Passant</option>
      <option value="greyhoundСourant">Greyhound Сourant</option>
      <option value="boarRampant">Boar Rampant</option>
      <option value="horseRampant">Horse Rampant</option>
      <option value="horseSalient">Horse Salient</option>
      <option value="bullPassant">Bull Passant</option>
      <option value="bullHeadCaboshed">Bull Head Caboshed</option>
      <option value="deerHeadCaboshed">Deer Head Caboshed</option>
      <option value="serpent">Serpent</option>
      <option value="eagle">Eagle</option>
      <option value="raven">Raven</option>
      <option value="cock">Cock</option>
      <option value="parrot">Parrot</option>
      <option value="swan">Swan</option>
      <option value="swanErased">Swan Erased</option>
      <option value="heron">Heron</option>
      <option value="dragonPassant">Dragon Passant</option>
      <option value="wyvern">Wyvern</option>
      <option value="griffinRampant">Griffin Rampant</option>
      <option value="griffinPassant">Griffin Passant</option>
      <option value="eagleTwoHeards">Eagle with Two Heads</option>
      <option value="unicornRampant">Unicorn Rampant</option>
      <option value="pegasus">Pegasus</option>
      <option value="escallop">Escallop</option>
      <option value="pike">Pike</option>
      <option value="cancer">Cancer</option>
      <option value="sword">Sword</option>
      <option value="hatchet">Hatchet</option>
      <option value="lochaberAxe">Lochaber Axe</option>
      <option value="mallet">Mallet</option>
      <option value="hand">Hand</option>
      <option value="crown">Crown</option>
      <option value="key">Key</option>
      <option value="buckle">Buckle</option>
      <option value="bugleHorn">Bugle Horn</option>
      <option value="horseshoe">Horseshoe</option>
      <option value="stagsAttires">Stag's Attires</option>
      <option value="cowHorns">Cow's Horns</option>
      <option value="wing">Wing</option>
      <option value="wingSword">Wing with Sword</option>
      <option value="lute">Lute</option>
      <option value="harp">Harp</option>
      <option value="wheel">Wheel</option>
      <option value="boat">Boat</option>
    </select>

    <select id="divisionTincture1Select">
      <option value="argent">Argent</option>
      <option value="or">Or</option>
      <option value="gules">Gules</option>
      <option value="sable" selected>Sable</option>
      <option value="azure">Azure</option>
      <option value="vert">Vert</option>
      <option value="purpure">Purpure</option>
    </select>

    <select id="divisionTincture2Select" style="display:none">
      <option value="argent" selected>Argent</option>
      <option value="or">Or</option>
      <option value="gules">Gules</option>
      <option value="sable">Sable</option>
      <option value="azure">Azure</option>
      <option value="vert">Vert</option>
      <option value="purpure">Purpure</option>
    </select>

    <select id="divisionPatternSize" style="display:none">
      <option value="big">big</option>
      <option value="standard" selected>standard</option>
      <option value="small">small</option>
      <option value="smaller">smaller</option>
      <option value="smallest">smallest</option>
    </select>
  </fieldset>

  <fieldset>
    <legend>Ordinary</legend>
    <select id="ordinarySelect">
      <option value="no">No</option>
      <option value="pale">Pale</option>
      <option value="fess">Fess</option>
      <option value="bend">Bend</option>
      <option value="bendSinister">Bend Sinister</option>
      <option value="chief">Chief</option>
      <option value="bar">Bar</option>
      <option value="gemelle">Gemelle</option>
      <option value="fessCotissed">Fess Cotissed</option>
      <option value="fessDoubleCotissed">Fess Double Cotissed</option>
      <option value="bendlet">Bendlet</option>
      <option value="bendletSinister">Bendlet Sinister</option>
      <option value="cross">Cross</option>
      <option value="crossParted">Cross Parted</option>
      <option value="saltire">Saltire</option>
      <option value="saltireParted">Saltire Parted</option>
      <option value="bordure">Bordure</option>
      <option value="orle">Orle</option>
      <option value="terrace">Terrace</option>
      <option value="mount">Mount</option>
      <option value="point">Point</option>
      <option value="flaunches">Flaunches</option>
      <option value="gore">Gore</option>
      <option value="flaunches">Flaunches</option>
      <option value="qyron">Qyron</option>
      <option value="quarter">Quarter</option>
      <option value="canton">Canton</option>
      <option value="pall">Pall</option>
      <option value="pallReversed">Pall Reversed</option>
      <option value="chevron">Chevron</option>
      <option value="chevronReversed">Chevron Reversed</option>
      <option value="pile">Pile</option>
      <option value="pileInBend">Pile In Bend</option>
      <option value="pileInBendSinister">Pile In Bend Sinister</option>
      <option value="piles">Piles</option>
      <option value="pilesInPoint">Piles In Point</option>
      <option value="label">Label</option>
    </select>

    <select id="ordinaryLineSelect">
      <option value="straight">straight</option>
      <option value="wavy">wavy</option>
      <option value="engrailed">engrailed</option>
      <option value="invecked">invecked</option>
      <option value="embattled">embattled</option>
      <option value="raguly">raguly</option>
      <option value="urdy">urdy</option>
      <option value="dancetty">dancetty</option>
      <option value="indented">indented</option>
      <option value="dentilly">dentilly</option>
      <option value="bevilled">bevilled</option>
      <option value="angled">angled</option>
      <option value="flechy">flechy</option>
      <option value="barby">barby</option>
      <option value="enclavy">enclavy</option>
      <option value="escartely">escartely</option>
      <option value="arched">arched</option>
      <option value="archedReversed">archedReversed</option>
      <option value="nowy">nowy</option>
      <option value="nowyReversed">nowyReversed</option>
      <option value="embattledGhibellin">embattledGhibellin</option>
      <option value="embattledNotched">embattledNotched</option>
      <option value="embattledGrady">embattledGrady</option>
      <option value="dovetailedIntented">dovetailedIntented</option>
      <option value="dovetailed">dovetailed</option>
      <option value="potenty">potenty</option>
      <option value="potentyDexter">potentyDexter</option>
      <option value="potentySinister">potentySinister</option>
      <option value="rayonne">rayonne</option>
      <option value="nebuly">nebuly</option>
      <option value="seaWaves">seaWaves</option>
      <option value="dragonTeeth">dragonTeeth</option>
      <option value="firTrees">firTrees</option>
    </select>

    <select id="ordinaryTinctureSelect">
      <option value="argent">Argent</option>
      <option value="or">Or</option>
      <option value="gules" selected>Gules</option>
      <option value="sable">Sable</option>
      <option value="azure">Azure</option>
      <option value="vert">Vert</option>
      <option value="purpure">Purpure</option>
    </select>

    <select id="ordinaryTypeSelect">
      <option value="full">Full</option>
      <option value="counter">Countercharged</option>
      <option value="crop">Crop</option>
    </select>

    <input type="number" max="2" min="0.1" step="0.01" id="ordinarySizeInput" value="1"/>
    <input type="number" max="100" min="-100" step="1" id="ordinaryShiftXInput" value="0"/>
    <input type="number" max="100" min="-100" step="1" id="ordinaryShiftYInput" value="0"/>
  </fieldset>

  <template id="chargeTemplate">
    <fieldset id="charge">
      <legend>Charge </legend>
      <select id="chargeSelect">
        <option value="no">No</option>
        <option value="lozenge">lozenge</option>
        <option value="fusil">fusil</option>
        <option value="mascle">mascle</option>
        <option value="rustre">rustre</option>
        <option value="lozengeFaceted">lozengeFaceted</option>
        <option value="lozengePloye">lozengePloye</option>
        <option value="roundel">roundel</option>
        <option value="annulet">annulet</option>
        <option value="mullet">mullet</option>
        <option value="mulletPierced">mulletPierced</option>
        <option value="mulletFaceted">mulletFaceted</option>
        <option value="mullet4">mullet4</option>
        <option value="mullet6">mullet6</option>
        <option value="mullet6Pierced">mullet6Pierced</option>
        <option value="mullet6Faceted">mullet6Faceted</option>
        <option value="mullet7">mullet7</option>
        <option value="mullet8">mullet8</option>
        <option value="mullet10">mullet10</option>
        <option value="estoile">estoile</option>
        <option value="sun">sun</option>
        <option value="inescutcheon">inescutcheon</option>
        <option value="billet">billet</option>
        <option value="triangle">triangle</option>
        <option value="trianglePierced">trianglePierced</option>
        <option value="goutte">goutte</option>
        <option value="heart">heart</option>
        <option value="pique">pique</option>
        <option value="trefle">trefle</option>
        <option value="сarreau">сarreau</option>
        <option value="fleurDeLis">fleurDeLis</option>
        <option value="sunInSplendour">sunInSplendour</option>
        <option value="crescent">crescent</option>
        <option value="compassRose">compassRose</option>
        <option value="crossHummetty">Сross Hummetty</option>
        <option value="crossVoided">Сross Voided</option>
        <option value="crossPattee">Сross Pattee</option>
        <option value="crossPotent">Сross Potent</option>
        <option value="crossCrosslet">Сross Сrosslet</option>
        <option value="crossClechy">Сross Clechy</option>
        <option value="crossBottony">Сross Bottony</option>
        <option value="crossFleury">Сross Fleury</option>
        <option value="crossPatonce">Сross Patonce</option>
        <option value="crossPommy">Сross Pommy</option>
        <option value="crossGamma">Сross Gamma</option>
        <option value="crossArrowed">Сross Barby</option>
        <option value="crossFitchy">Сross Fitchy</option>
        <option value="crossCercelee">Сross Cercelee</option>
        <option value="crossMoline">Сross Moline</option>
        <option value="crossFourchy">Сross Fourchy</option>
        <option value="crossAvellane">Сross Avellane</option>
        <option value="crossErminee">Сross Erminee</option>
        <option value="crossMaltese">Сross Maltese</option>
        <option value="crossCeltic">Сross Celtic</option>
        <option value="crossOccitan">Сross Occitan</option>
        <option value="crossSaltire">Сross Saltire</option>
        <option value="crossTau">Сross Tau</option>
        <option value="cinquefoil">Сinquefoil</option>
        <option value="rose">Rose</option>
        <option value="lionRampant">Lion Rampant</option>
        <option value="lionPassant">Lion Passant</option>
        <option value="wolfPassant">Wolf Passant</option>
        <option value="greyhoundСourant">Greyhound Сourant</option>
        <option value="boarRampant">Boar Rampant</option>
        <option value="horseRampant">Horse Rampant</option>
        <option value="horseSalient">Horse Salient</option>
        <option value="bullPassant">Bull Passant</option>
        <option value="bullHeadCaboshed">Bull Head Caboshed</option>
        <option value="deerHeadCaboshed">Deer Head Caboshed</option>
        <option value="serpent">Serpent</option>
        <option value="eagle">Eagle</option>
        <option value="raven">Raven</option>
        <option value="cock">Cock</option>
        <option value="parrot">Parrot</option>
        <option value="swan">Swan</option>
        <option value="swanErased">Swan Erased</option>
        <option value="heron">Heron</option>
        <option value="dragonPassant">Dragon Passant</option>
        <option value="wyvern">Wyvern</option>
        <option value="griffinRampant">Griffin Rampant</option>
        <option value="griffinPassant">Griffin Passant</option>
        <option value="eagleTwoHeards">Eagle with Two Heads</option>
        <option value="unicornRampant">Unicorn Rampant</option>
        <option value="pegasus">Pegasus</option>
        <option value="fountain">Fountain</option>
        <option value="garb">Garb</option>
        <option value="escallop">Escallop</option>
        <option value="pike">Pike</option>
        <option value="cancer">Cancer</option>
        <option value="sword">Sword</option>
        <option value="hatchet">Hatchet</option>
        <option value="lochaberAxe">Lochaber Axe</option>
        <option value="mallet">Mallet</option>
        <option value="hand">Hand</option>
        <option value="crown">Crown</option>
        <option value="key">Key</option>
        <option value="buckle">Buckle</option>
        <option value="bugleHorn">Bugle Horn</option>
        <option value="horseshoe">Horseshoe</option>
        <option value="stagsAttires">Stag's Attires</option>
        <option value="cowHorns">Cow's Horns</option>
        <option value="wing">Wing</option>
        <option value="wingSword">Wing with Sword</option>
        <option value="lute">Lute</option>
        <option value="harp">Harp</option>
        <option value="wheel">Wheel</option>
        <option value="boat">Boat</option>
      </select>

      <input id="chargePositionInput"/>
      <select id="chargePositionSelect">
        <option value="e">e</option>
        <option value="abcdefgzi">abcdefgzi</option>
        <option value="beh">beh</option>
        <option value="behdf">behdf</option>
        <option value="acegi">acegi</option>
        <option value="kn">kn</option>
        <option value="df">df</option>
        <option value="bhdf">bhdf</option>
        <option value="jei">jei</option>
        <option value="abc">abc</option>
        <option value="jlh">jlh</option>
        <option value="jln">jln</option>
        <option value="jleh">jleh</option>
        <option value="def">def</option>
        <option value="abcpqh">abcpqh</option>
        <option value="ABCDEFGHIKL">ABCDEFGHIKL</option>
        <option value="bdefh">bdefh</option>
        <option value="joe">joe</option>
        <option value="pqe">pqe</option>
        <option value="eknpq">eknpq</option>
      </select>

      <select id="chargeTinctureSelect">
        <option value="argent">Argent</option>
        <option value="or">Or</option>
        <option value="gules">Gules</option>
        <option value="sable">Sable</option>
        <option value="azure">Azure</option>
        <option value="vert">Vert</option>
        <option value="purpure">Purpure</option>
      </select>

      <select id="chargeTypeSelect">
        <!-- display only if there is a division -->
        <option value="overall" selected>Above all</option>
        <option value="field">Dimidiated (main)</option>
        <option value="division">Dimidiated (division)</option>
        <option value="counter">Countercharged</option>
      </select><br>

      <input type="number" max="2" min="0.1" step="0.01" id="chargeSizeInput" value="1"/>
      <input type="number" max="100" min="-100" step="1" id="chargeShiftXInput" value="0"/>
      <input type="number" max="100" min="-100" step="1" id="chargeShiftYInput" value="0"/>

      <input type="checkbox" id="chargeSinister"/>
      <label for="chargeSinister">Sinister</label>
      <input type="checkbox" id="chargeReversed"/>
      <label for="chargeReversed">Reversed</label>
    </fieldset>
  </template>
</div>

<style>
  #menu {
		user-select: none;
		width: 45%;
		display: inline-block;
		vertical-align: top;
		margin-top: .7em;
  }

  input {
    margin: .4rem;
    width: 5em;
  }

  select {
    width: 5em;
  }

  input[type="number"] {
    width: 3.5em;
  }

  input[type="checkbox"] {
    width: 1em;
    cursor: pointer;
  }

  fieldset {
    margin-bottom: .8em;
  }

  fieldset > * {
    margin: 0;
  }

  legend {
    background-color: #000;
    color: #fff;
    padding: 3px 6px;
  }

  legend > button {
    font-size: 0.6em;
    padding: 0;
    background-color: #000;
    border: 1px solid #aaa;
    cursor: pointer;
  }

  legend > button:hover {
    border: 1px solid #fff;
  }

  legend > button:active {
    transform: translateY(1px);
    border: 1px solid #fff;
    outline: none;
  }

  .output {
    font: 1rem 'Fira Sans', sans-serif;
  }
</style>