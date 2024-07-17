# Armoria API

_API for **[Armoria](https://github.com/Azgaar/Armoria)** — procedural heraldry generator and editor._

The API allows to `GET` random or predefined vector and raster heraldic images of a given size in a given format. It also allows to assign a specific coat of arms to a seed value (so called _claiming_).

API is hosted on _Heroku_. Please [contact me directly](mailto:maxganiev@yandex.com) if you want to use this API.

![example1](https://armoria.herokuapp.com/png/120.0001)
![example2](https://armoria.herokuapp.com/png/120.0002)
![example3](https://armoria.herokuapp.com/png/120.0003)
![example4](https://armoria.herokuapp.com/png/120.0004)
![example5](https://armoria.herokuapp.com/png/120.0005)

Try it: [armoria.herokuapp.com/?size=500&format=svg&seed=123](https://armoria.herokuapp.com/?size=500&format=svg&seed=123).

Remove seed to generate a random coat or arms: [armoria.herokuapp.com/?size=500&format=svg](https://armoria.herokuapp.com/?size=500&format=svg)

## Basic usage

#### Parameters

Basic usage is to request coat of arms generation with URL parameters:

> armoria.herokuapp.com/`format`/`size`/`seed`

- **format:** `svg` | `png` | <small>default:</small> `svg`

Armoria generates all images in `svg` by default. But as there are cases where `svg` cannot be used, the tool can convert images to `png`. Raster images quality depends on size, but relatively big images may be slow to get. There can be conversion issues, so `svg` is always preferable.

- **size:** `number` | <small>default:</small> `500`

Size in pixels. Can be any number set as `200` or `200px`. For `svg` it just sets `width` and `height`, raster images are getting actually rescaled and size defines their quality.

- **seed:** `string` | <small>optional</small>

Seed is a string (i.e. `123` is considered as `"123"`) that defines procedural coat of arms generation. The same string will produce the same coat of arms irrespective of size and image format. This statement is only valid if generation code remains the same, so seed must not be used as a saving method.

If `seed` is not provided, the tool generates random 9-digits value. Omit `seed` parameter if you want to get random coat of arms for each request.

`Seed` is getting parsed to lower case, so `Azgaar` will produce the same image as `azgaar`. A few symbols are not supported and getting automatically replaced by underscore (`#`, `'`, ` `).

#### Query attributes

The same parameters (`format`, `size`, `seed`) can be used as query attributes. In this case parameters are not required:

> armoria.herokuapp.com/?`format=svg`&`size=200`&`seed=123456789`

Attributes that are supported only in query format are `coa`, `shield` and colors.

- **coa:** `string` | <small>supersedes `seed`</small>
  - `t1`: field tincture or pattern (fur)
  - `division`: object with `division`, `t` and `line` attributes
  - `ordinaries`: array with `ordinary`, `t`, `line` and `size` attributes
  - `charges`: array with `charge`, `t`, `p`, `size`, `sinister` and `reversed` attributes

API can skip procedural generation and render specific coat of arms (`coa`). Attribute accepts json object [encoded](https://meyerweb.com/eric/tools/dencoder/) for URL usage.

To get coa string open [Armoria GUI](https://github.com/Azgaar/Armoria), edit coat of arms as you want and then click on `Save` → `Copy COA string`. It will copy coa string to your clipboard.

- **shield:** `string` | <small>default:</small> `random`

Armoria supports >40 shield shapes. Any ot them can be used via API if exact names is passed as `shield` attribute. Available shapes:

`heater` | `spanish` | `french` | `horsehead` | `horsehead2` | `polish` | `hessen` | `swiss` | `boeotian` | `roman` | `kite` | `oldFrench` | `renaissance` | `baroque` | `targe` | `targe2` | `pavise` | `wedged` | `round` | `oval` | `vesicaPiscis` | `square` | `diamond` | `no` | `flag` | `pennon` | `guidon` | `banner` | `dovetail` | `gonfalon` | `pennant` | `fantasy1` | `fantasy2` | `fantasy3` | `fantasy4` | `fantasy5` | `noldor` | `gondor` | `easterling` | `erebor` | `ironHills` | `urukHai` | `moriaOrc`

### Custom colors

Armoria has 10 [tinctures](<https://en.wikipedia.org/wiki/Tincture_(heraldry)>) (colors) available by default:

| Tincture | Type   | Represents | Chance | Color                                                                                        |
| -------- | ------ | ---------- | ------ | -------------------------------------------------------------------------------------------- |
| argent   | metal  | silver     | ~25%   | ![argent](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"argent"}) #fafafa     |
| or       | metal  | gold       | ~16%   | ![or](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"or"}) #ffe066             |
| gules    | colour | red        | ~17%   | ![gules](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"gules"}) #d7374a       |
| sable    | colour | black      | ~14%   | ![sable](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"sable"}) #333333       |
| azure    | colour | blue       | ~14%   | ![azure](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"azure"}) #377cd7       |
| vert     | colour | green      | ~7%    | ![vert](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"vert"}) #26c061         |
| purpure  | colour | purple     | ~13%   | ![purpure](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"purpure"}) #522d5b   |
| murrey   | stain  | mulberry   | ~1%    | ![murrey](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"murrey"}) #85185b     |
| sanguine | stain  | blood red  | ~1%    | ![sanguine](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"sanguine"}) #b63a3a |
| tenné    | stain  | tawny      | ~1%    | ![tenné](https://armoria.herokuapp.com/?format=png&size=16&coa={"t1":"tenné"}) #cc7f19       |

It is possible to use custom tinctures or redefine default colors using query attributes.

Exact color can be set as a part of `coa` attribute. You can replace tincture name with color hex code, e.g. turn `{"t1": "azure"}` into hurting-eyes blue with `{"t1": "#0000ff"}`. URL must be encoded, so the link would be like [armoria.herokuapp.com/?coa={%22t1%22:%22%230000ff%22}](https://armoria.herokuapp.com/?coa={%22t1%22:%22%230000ff%22}).

The resulting link is not readable, so you can also define colors using specific attributes for each of them like [armoria.herokuapp.com/svg/500/1?gules=bb1100&or=FFD700&azure=00aaff](https://armoria.herokuapp.com/svg/500/1?gules=bb1100&or=FFD700&azure=00aaff). Hash symbol must be dropped.

## Claiming

A specific coat of arms can be assigned to a value. In this case every time this seed (`name`) is requested, the same claimed coat of arms will be displayed. Assignment is stored in _MongoDB Atlas_ with set (`claim`), update (`reclaim`) and delete (`unclaim`) operations allowed.

This functional can be used to set up a specific heraldic image for your name, country, city or any other word. Claims can be password-protected. For real objects like countries we are planning to set up coat of arms that resemble real ones. Admin users ([Discord community](https://discordapp.com/invite/X7E84HU) members) have rights to update or delete claims it they found them inappropriate.

### Claim

> armoria.herokuapp.com/claim/`name`/`coa`/`key`

- **name:** `string` | <small>non-numerical</small>

Name is a string to be associated with a specific coat of arms, not the one auto-generated by the tool. Once assigned, `name` works as `seed` in its basic usage. Numerical names like `123` are assigned foe procedural generation and cannot be claimed. `Name` is getting parsed the same way as `seed`, so `Armoria API` will be parsed to `armoria_api`.

- **coa:** `string`

Coat of arms object [encoded](https://meyerweb.com/eric/tools/dencoder/) for URL usage. Co copy it open [Armoria GUI](https://github.com/Azgaar/Armoria), edit coat of arms as you want and then click on `Save` → `Copy COA string`. See in details [above](#query-attributes).

- **key:** `string` | <small>optional</small>

User-defined password. If omitted, no password will be set and anyone will be able to change or delete the claim. Password accepts any string. Please make sure you save it locally as there is no way to restore the key if you forget it.

### Reclaim

> armoria.herokuapp.com/claim/`name`/`coa`/`key`

Raclaim updates the record in the database. If the current claim is password-protected, `key` value should be set. If not, it will accept any value or no value.

### Unclaim

> armoria.herokuapp.com/unclaim/`name`/`key`

Unclaim removes the record from the database. For unclaim you need `name` and `key` (if was set on claim), but `coa` is not required.

## Examples

Coat of arms generated for seed `123456789`, rendered in `svg`, size is `400px`:

> [armoria.herokuapp.com/svg/400px/123456789](https://armoria.herokuapp.com/svg/400px/123456789)

Coat of arms generated for seed `Armortown`, rendered in `png`, size is `800`px:

> [armoria.herokuapp.com/png/800/Armortown](https://armoria.herokuapp.com/png/800/Armortown)

Random coat of arms in `png`, size `200`px:

> [armoria.herokuapp.com/png/200](https://armoria.herokuapp.com/png/200)

Coat of arms manually created in Armoria GUI, default format (`svg`) and size (`500px`):

> [armoria.herokuapp.com/?coa={"t1":"semy_of_lozengePloye-sable-argent-small","division":{"division":"perPale","line":"straight","t":"semy_of_mullet4-sable-argent-small"},"ordinaries":[{"ordinary":"mount","t":"azure"}],"charges":[{"charge":"lymphad","t":"or","p":"e","size":1.7}]}](https://armoria.herokuapp.com/?coa={"t1":"semy_of_lozengePloye-sable-argent-small","division":{"division":"perPale","line":"straight","t":"semy_of_mullet4-sable-argent-small"},"ordinaries":[{"ordinary":"mount","t":"azure"}],"charges":[{"charge":"lymphad","t":"or","p":"e","size":1.7}]})

Coat of arms manually created in Armoria GUI, rendered in `png` with size `200`px:

> [armoria.herokuapp.com/?coa={"t1":"semy_of_lozengePloye-sable-argent-small","division":{"division":"perPale","line":"straight","t":"semy_of_mullet4-sable-argent-small"},"ordinaries":[{"ordinary":"mount","t":"azure"}],"charges":[{"charge":"lymphad","t":"or","p":"e","size":1.7}]}&format=png&size=200](https://armoria.herokuapp.com/?coa={"t1":"semy_of_lozengePloye-sable-argent-small","division":{"division":"perPale","line":"straight","t":"semy_of_mullet4-sable-argent-small"},"ordinaries":[{"ordinary":"mount","t":"azure"}],"charges":[{"charge":"lymphad","t":"or","p":"e","size":1.7}]}&format=png&size=200)

Claim or reclaim name `test` (no password protection):

> [armoria.herokuapp.com/claim/test/{"t1":"gules","charges":[{"charge":"fusil","t":"argent","p":"e","size":1.5}],"shield":"heater"}](https://armoria.herokuapp.com/claim/test/{"t1":"gules","charges":[{"charge":"fusil","t":"argent","p":"e","size":1.5}],"shield":"heater"})

Claim or reclaim name `test2` with password `secret123`:

> [armoria.herokuapp.com/claim/test2/{"t1":"ermine-sable-or","division":{"division":"chevronny","t":"argent"},"shield":"spanish"}/secret123](https://armoria.herokuapp.com/claim/test2/{"t1":"ermine-sable-or","division":{"division":"chevronny","t":"argent"},"shield":"spanish"}/secret123)

Unclaim name `test2` using password `secret123`:

> [armoria.herokuapp.com/unclaim/test2/secret123](https://armoria.herokuapp.com/unclaim/test2/secret123)

## License

The code is distributed under [MIT](https://opensource.org/licenses/MIT).

Simple svg shapes and charges are self-made and available under [CC0](https://creativecommons.org/share-your-work/public-domain/cc0/). Complex charges are historical, svg renders are coming from [WappenWiki](http://wappenwiki.org) and available for non-commercial use under [CC3](https://creativecommons.org/licenses/by-nc/3.0/). Source info is added to svg files. All images are manually optimized by me.
