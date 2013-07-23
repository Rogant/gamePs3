﻿
var cr = {};
cr.plugins_ = {};
cr.behaviors = {};
if (typeof Object.getPrototypeOf !== "function")
{
	if (typeof "test".__proto__ === "object")
	{
		Object.getPrototypeOf = function(object) {
			return object.__proto__;
		};
	}
	else
	{
		Object.getPrototypeOf = function(object) {
			return object.constructor.prototype;
		};
	}
}
(function(){
	cr.logexport = function (msg)
	{
		if (console && console.log)
			console.log(msg);
	};
	cr.seal = function(x)
	{
		return x;
	};
	cr.freeze = function(x)
	{
		return x;
	};
	cr.is_undefined = function (x)
	{
		return typeof x === "undefined";
	};
	cr.is_number = function (x)
	{
		return typeof x === "number";
	};
	cr.is_string = function (x)
	{
		return typeof x === "string";
	};
	cr.isPOT = function (x)
	{
		return x > 0 && ((x - 1) & x) === 0;
	};
	cr.abs = function (x)
	{
		return (x < 0 ? -x : x);
	};
	cr.max = function (a, b)
	{
		return (a > b ? a : b);
	};
	cr.min = function (a, b)
	{
		return (a < b ? a : b);
	};
	cr.PI = Math.PI;
	cr.round = function (x)
	{
		return (x + 0.5) | 0;
	};
	cr.floor = function (x)
	{
		return x | 0;
	};
	function Vector2(x, y)
	{
		this.x = x;
		this.y = y;
		cr.seal(this);
	};
	Vector2.prototype.offset = function (px, py)
	{
		this.x += px;
		this.y += py;
		return this;
	};
	Vector2.prototype.mul = function (px, py)
	{
		this.x *= px;
		this.y *= py;
		return this;
	};
	cr.vector2 = Vector2;
	cr.segments_intersect = function(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)
	{
		if (cr.max(a1x, a2x) < cr.min(b1x, b2x)
		 || cr.min(a1x, a2x) > cr.max(b1x, b2x)
		 || cr.max(a1y, a2y) < cr.min(b1y, b2y)
		 || cr.min(a1y, a2y) > cr.max(b1y, b2y))
		{
			return false;
		}
		var dpx = b1x - a1x + b2x - a2x;
		var dpy = b1y - a1y + b2y - a2y;
		var qax = a2x - a1x;
		var qay = a2y - a1y;
		var qbx = b2x - b1x;
		var qby = b2y - b1y;
		var d = cr.abs(qay * qbx - qby * qax);
		var la = qbx * dpy - qby * dpx;
		var lb = qax * dpy - qay * dpx;
		return cr.abs(la) <= d && cr.abs(lb) <= d;
	};
	function Rect(left, top, right, bottom)
	{
		this.set(left, top, right, bottom);
		cr.seal(this);
	};
	Rect.prototype.set = function (left, top, right, bottom)
	{
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	};
	Rect.prototype.width = function ()
	{
		return this.right - this.left;
	};
	Rect.prototype.height = function ()
	{
		return this.bottom - this.top;
	};
	Rect.prototype.offset = function (px, py)
	{
		this.left += px;
		this.top += py;
		this.right += px;
		this.bottom += py;
		return this;
	};
	Rect.prototype.intersects_rect = function (rc)
	{
		return !(rc.right < this.left || rc.bottom < this.top || rc.left > this.right || rc.top > this.bottom);
	};
	Rect.prototype.contains_pt = function (x, y)
	{
		return (x >= this.left && x <= this.right) && (y >= this.top && y <= this.bottom);
	};
	cr.rect = Rect;
	function Quad()
	{
		this.tlx = 0;
		this.tly = 0;
		this.trx = 0;
		this.try_ = 0;	// is a keyword otherwise!
		this.brx = 0;
		this.bry = 0;
		this.blx = 0;
		this.bly = 0;
		cr.seal(this);
	};
	Quad.prototype.set_from_rect = function (rc)
	{
		this.tlx = rc.left;
		this.tly = rc.top;
		this.trx = rc.right;
		this.try_ = rc.top;
		this.brx = rc.right;
		this.bry = rc.bottom;
		this.blx = rc.left;
		this.bly = rc.bottom;
	};
	Quad.prototype.set_from_rotated_rect = function (rc, a)
	{
		if (a === 0)
		{
			this.set_from_rect(rc);
		}
		else
		{
			var sin_a = Math.sin(a);
			var cos_a = Math.cos(a);
			var left_sin_a = rc.left * sin_a;
			var top_sin_a = rc.top * sin_a;
			var right_sin_a = rc.right * sin_a;
			var bottom_sin_a = rc.bottom * sin_a;
			var left_cos_a = rc.left * cos_a;
			var top_cos_a = rc.top * cos_a;
			var right_cos_a = rc.right * cos_a;
			var bottom_cos_a = rc.bottom * cos_a;
			this.tlx = left_cos_a - top_sin_a;
			this.tly = top_cos_a + left_sin_a;
			this.trx = right_cos_a - top_sin_a;
			this.try_ = top_cos_a + right_sin_a;
			this.brx = right_cos_a - bottom_sin_a;
			this.bry = bottom_cos_a + right_sin_a;
			this.blx = left_cos_a - bottom_sin_a;
			this.bly = bottom_cos_a + left_sin_a;
		}
	};
	Quad.prototype.offset = function (px, py)
	{
		this.tlx += px;
		this.tly += py;
		this.trx += px;
		this.try_ += py;
		this.brx += px;
		this.bry += py;
		this.blx += px;
		this.bly += py;
		return this;
	};
	Quad.prototype.bounding_box = function (rc)
	{
		rc.left =   cr.min(cr.min(this.tlx, this.trx),  cr.min(this.brx, this.blx));
		rc.top =    cr.min(cr.min(this.tly, this.try_), cr.min(this.bry, this.bly));
		rc.right =  cr.max(cr.max(this.tlx, this.trx),  cr.max(this.brx, this.blx));
		rc.bottom = cr.max(cr.max(this.tly, this.try_), cr.max(this.bry, this.bly));
	};
	Quad.prototype.contains_pt = function (x, y)
	{
		var v0x = this.trx - this.tlx;
		var v0y = this.try_ - this.tly;
		var v1x = this.brx - this.tlx;
		var v1y = this.bry - this.tly;
		var v2x = x - this.tlx;
		var v2y = y - this.tly;
		var dot00 = v0x * v0x + v0y * v0y
		var dot01 = v0x * v1x + v0y * v1y
		var dot02 = v0x * v2x + v0y * v2y
		var dot11 = v1x * v1x + v1y * v1y
		var dot12 = v1x * v2x + v1y * v2y
		var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		if ((u >= 0.0) && (v > 0.0) && (u + v < 1))
			return true;
		v0x = this.blx - this.tlx;
		v0y = this.bly - this.tly;
		var dot00 = v0x * v0x + v0y * v0y
		var dot01 = v0x * v1x + v0y * v1y
		var dot02 = v0x * v2x + v0y * v2y
		invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		return (u >= 0.0) && (v > 0.0) && (u + v < 1);
	};
	Quad.prototype.at = function (i, xory)
	{
		i = i % 4;
		if (i < 0)
			i += 4;
		switch (i)
		{
			case 0: return xory ? this.tlx : this.tly;
			case 1: return xory ? this.trx : this.try_;
			case 2: return xory ? this.brx : this.bry;
			case 3: return xory ? this.blx : this.bly;
			default: return xory ? this.tlx : this.tly;
		}
	};
	Quad.prototype.midX = function ()
	{
		return (this.tlx + this.trx  + this.brx + this.blx) / 4;
	};
	Quad.prototype.midY = function ()
	{
		return (this.tly + this.try_ + this.bry + this.bly) / 4;
	};
	Quad.prototype.intersects_quad = function (rhs)
	{
		var midx = rhs.midX();
		var midy = rhs.midY();
		if (this.contains_pt(midx, midy))
			return true;
		midx = this.midX();
		midy = this.midY();
		if (rhs.contains_pt(midx, midy))
			return true;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		var i, j;
		for (i = 0; i < 4; i++)
		{
			for (j = 0; j < 4; j++)
			{
				a1x = this.at(i, true);
				a1y = this.at(i, false);
				a2x = this.at(i + 1, true);
				a2y = this.at(i + 1, false);
				b1x = rhs.at(j, true);
				b1y = rhs.at(j, false);
				b2x = rhs.at(j + 1, true);
				b2y = rhs.at(j + 1, false);
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
					return true;
			}
		}
		return false;
	};
	cr.quad = Quad;
	cr.RGB = function (red, green, blue)
	{
		return Math.max(Math.min(red, 255), 0)
			 | (Math.max(Math.min(green, 255), 0) << 8)
			 | (Math.max(Math.min(blue, 255), 0) << 16);
	};
	cr.GetRValue = function (rgb)
	{
		return rgb & 0xFF;
	};
	cr.GetGValue = function (rgb)
	{
		return (rgb & 0xFF00) >> 8;
	};
	cr.GetBValue = function (rgb)
	{
		return (rgb & 0xFF0000) >> 16;
	};
	cr.shallowCopy = function (a, b, allowOverwrite)
	{
		var attr;
		for (attr in b)
		{
			if (b.hasOwnProperty(attr))
			{
;
				a[attr] = b[attr];
			}
		}
		return a;
	};
	cr.arrayRemove = function (arr, index)
	{
		var i, len;
		index = cr.floor(index);
		if (index < 0 || index >= arr.length)
			return;							// index out of bounds
		if (index === 0)					// removing first item
			arr.shift();
		else if (index === arr.length - 1)	// removing last item
			arr.pop();
		else
		{
			for (i = index, len = arr.length - 1; i < len; i++)
				arr[i] = arr[i + 1];
			arr.length = len;
		}
	};
	cr.shallowAssignArray = function(dest, src)
	{
		dest.length = src.length;
		var i, len;
		for (i = 0, len = src.length; i < len; i++)
			dest[i] = src[i];
	};
	cr.arrayFindRemove = function (arr, item)
	{
		var index = arr.indexOf(item);
		if (index !== -1)
			cr.arrayRemove(arr, index);
	};
	cr.clamp = function(x, a, b)
	{
		if (x < a)
			return a;
		else if (x > b)
			return b;
		else
			return x;
	};
	cr.to_radians = function(x)
	{
		return x / (180.0 / cr.PI);
	};
	cr.to_degrees = function(x)
	{
		return x * (180.0 / cr.PI);
	};
	cr.clamp_angle_degrees = function (a)
	{
		a %= 360;       // now in (-360, 360) range
		if (a < 0)
			a += 360;   // now in [0, 360) range
		return a;
	};
	cr.clamp_angle = function (a)
	{
		a %= 2 * cr.PI;       // now in (-2pi, 2pi) range
		if (a < 0)
			a += 2 * cr.PI;   // now in [0, 2pi) range
		return a;
	};
	cr.to_clamped_degrees = function (x)
	{
		return cr.clamp_angle_degrees(cr.to_degrees(x));
	};
	cr.to_clamped_radians = function (x)
	{
		return cr.clamp_angle(cr.to_radians(x));
	};
	cr.angleTo = function(x1, y1, x2, y2)
	{
		var dx = x2 - x1;
        var dy = y2 - y1;
		return Math.atan2(dy, dx);
	};
	cr.angleDiff = function (a1, a2)
	{
		if (a1 === a2)
			return 0;
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		var n = s1 * s2 + c1 * c2;
		if (n >= 1)
			return 0;
		if (n <= -1)
			return cr.PI;
		return Math.acos(n);
	};
	cr.angleRotate = function (start, end, step)
	{
		var ss = Math.sin(start);
		var cs = Math.cos(start);
		var se = Math.sin(end);
		var ce = Math.cos(end);
		if (Math.acos(ss * se + cs * ce) > step)
		{
			if (cs * se - ss * ce > 0)
				return cr.clamp_angle(start + step);
			else
				return cr.clamp_angle(start - step);
		}
		else
			return cr.clamp_angle(end);
	};
	cr.angleClockwise = function (a1, a2)
	{
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		return c1 * s2 - s1 * c2 <= 0;
	};
	cr.distanceTo = function(x1, y1, x2, y2)
	{
		var dx = x2 - x1;
        var dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	};
	cr.xor = function (x, y)
	{
		return !x !== !y;
	};
	cr.lerp = function (a, b, x)
	{
		return a + (b - a) * x;
	};
	cr.wipe = function (obj)
	{
		var p;
		for (p in obj)
		{
			if (obj.hasOwnProperty(p))
				delete obj[p];
		}
	};
	cr.performance_now = function()
	{
		if (typeof window["performance"] !== "undefined")
		{
			var winperf = window["performance"];
			if (typeof winperf.now !== "undefined")
				return winperf.now();
			else if (typeof winperf["webkitNow"] !== "undefined")
				return winperf["webkitNow"]();
			else if (typeof winperf["msNow"] !== "undefined")
				return winperf["msNow"]();
		}
		return Date.now();
	};
	function ObjectSet_()
	{
		this.items = {};
		this.item_count = 0;
		this.values_cache = [];
		this.cache_valid = true;
		cr.seal(this);
	};
	ObjectSet_.prototype.contains = function (x)
	{
		return this.items.hasOwnProperty(x.toString());
	};
	ObjectSet_.prototype.add = function (x)
	{
		if (!this.contains(x))
		{
			this.items[x.toString()] = x;
			this.item_count++;
			this.cache_valid = false;
		}
		return this;
	};
	ObjectSet_.prototype.remove = function (x)
	{
		if (this.contains(x))
		{
			delete this.items[x.toString()];
			this.item_count--;
			this.cache_valid = false;
		}
		return this;
	};
	ObjectSet_.prototype.clear = function ()
	{
		cr.wipe(this.items);
		this.item_count = 0;
		this.values_cache.length = 0;
		this.cache_valid = true;
		return this;
	};
	ObjectSet_.prototype.isEmpty = function ()
	{
		return this.item_count === 0;
	};
	ObjectSet_.prototype.count = function ()
	{
		return this.item_count;
	};
	ObjectSet_.prototype.update_cache = function ()
	{
		if (this.cache_valid)
			return;
		this.values_cache.length = this.item_count;
		var p, n = 0;
		for (p in this.items)
		{
			if (this.items.hasOwnProperty(p))
				this.values_cache[n++] = this.items[p];
		}
;
		this.cache_valid = true;
	};
	ObjectSet_.prototype.values = function ()
	{
		this.update_cache();
		return this.values_cache.slice(0);
	};
	ObjectSet_.prototype.valuesRef = function ()
	{
		this.update_cache();
		return this.values_cache;
	};
	cr.ObjectSet = ObjectSet_;
	function KahanAdder_()
	{
		this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
		cr.seal(this);
	};
	KahanAdder_.prototype.add = function (v)
	{
		this.y = v - this.c;
	    this.t = this.sum + this.y;
	    this.c = (this.t - this.sum) - this.y;
	    this.sum = this.t;
	};
    KahanAdder_.prototype.reset = function ()
    {
        this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
    };
	cr.KahanAdder = KahanAdder_;
	cr.regexp_escape = function(text)
	{
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	function CollisionPoly_(pts_array_)
	{
		this.pts_cache = [];
		this.set_pts(pts_array_);
		cr.seal(this);
	};
	CollisionPoly_.prototype.set_pts = function(pts_array_)
	{
		this.pts_array = pts_array_;
		this.pts_count = pts_array_.length / 2;			// x, y, x, y... in array
		this.pts_cache.length = pts_array_.length;
		this.cache_width = -1;
		this.cache_height = -1;
		this.cache_angle = 0;
	};
	CollisionPoly_.prototype.is_empty = function()
	{
		return !this.pts_array.length;
	};
	CollisionPoly_.prototype.set_from_quad = function(q, offx, offy, w, h)
	{
		this.pts_cache.length = 8;
		this.pts_count = 4;
		var myptscache = this.pts_cache;
		myptscache[0] = q.tlx - offx;
		myptscache[1] = q.tly - offy;
		myptscache[2] = q.trx - offx;
		myptscache[3] = q.try_ - offy;
		myptscache[4] = q.brx - offx;
		myptscache[5] = q.bry - offy;
		myptscache[6] = q.blx - offx;
		myptscache[7] = q.bly - offy;
		this.cache_width = w;
		this.cache_height = h;
	};
	CollisionPoly_.prototype.set_from_poly = function (r)
	{
		this.pts_count = r.pts_count;
		cr.shallowAssignArray(this.pts_cache, r.pts_cache);
	};
	CollisionPoly_.prototype.cache_poly = function(w, h, a)
	{
		if (this.cache_width === w && this.cache_height === h && this.cache_angle === a)
			return;		// cache up-to-date
		this.cache_width = w;
		this.cache_height = h;
		this.cache_angle = a;
		var i, len, x, y;
		var sina = 0;
		var cosa = 1;
		var myptsarray = this.pts_array;
		var myptscache = this.pts_cache;
		if (a !== 0)
		{
			sina = Math.sin(a);
			cosa = Math.cos(a);
		}
		for (i = 0, len = this.pts_count; i < len; i++)
		{
			x = myptsarray[i*2] * w;
			y = myptsarray[i*2+1] * h;
			myptscache[i*2] = (x * cosa) - (y * sina);
			myptscache[i*2+1] = (y * cosa) + (x * sina);
		}
	};
	CollisionPoly_.prototype.contains_pt = function (a2x, a2y)
	{
		var myptscache = this.pts_cache;
		if (a2x === myptscache[0] && a2y === myptscache[1])
			return true;
		var a1x = -this.cache_width * 5 - 1;
		var a1y = -this.cache_height * 5 - 1;
		var a3x = this.cache_width * 5 + 1;
		var a3y = -1;
		var b1x, b1y, b2x, b2y;
		var i, len;
		var count1 = 0, count2 = 0;
		for (i = 0, len = this.pts_count; i < len; i++)
		{
			b1x = myptscache[i*2];
			b1y = myptscache[i*2+1];
			b2x = myptscache[((i+1)%len)*2];
			b2y = myptscache[((i+1)%len)*2+1];
			if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
				count1++;
			if (cr.segments_intersect(a3x, a3y, a2x, a2y, b1x, b1y, b2x, b2y))
				count2++;
		}
		return (count1 % 2 === 1) || (count2 % 2 === 1);
	};
	CollisionPoly_.prototype.intersects_poly = function (rhs, offx, offy)
	{
		var rhspts = rhs.pts_cache;
		var mypts = this.pts_cache;
		if (this.contains_pt(rhspts[0] + offx, rhspts[1] + offy))
			return true;
		if (rhs.contains_pt(mypts[0] - offx, mypts[1] - offy))
			return true;
		var i, leni, j, lenj;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		for (i = 0, leni = this.pts_count; i < leni; i++)
		{
			a1x = mypts[i*2];
			a1y = mypts[i*2+1];
			a2x = mypts[((i+1)%leni)*2];
			a2y = mypts[((i+1)%leni)*2+1];
			for (j = 0, lenj = rhs.pts_count; j < lenj; j++)
			{
				b1x = rhspts[j*2] + offx;
				b1y = rhspts[j*2+1] + offy;
				b2x = rhspts[((j+1)%lenj)*2] + offx;
				b2y = rhspts[((j+1)%lenj)*2+1] + offy;
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
					return true;
			}
		}
		return false;
	};
	cr.CollisionPoly = CollisionPoly_;
	var fxNames = [ "lighter",
					"xor",
					"copy",
					"destination-over",
					"source-in",
					"destination-in",
					"source-out",
					"destination-out",
					"source-atop",
					"destination-atop"];
	cr.effectToCompositeOp = function(effect)
	{
		if (effect <= 0 || effect >= 11)
			return "source-over";
		return fxNames[effect - 1];	// not including "none" so offset by 1
	};
	cr.setGLBlend = function(this_, effect, gl)
	{
		if (!gl)
			return;
		this_.srcBlend = gl.ONE;
		this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
		switch (effect) {
		case 1:		// lighter (additive)
			this_.srcBlend = gl.ONE;
			this_.destBlend = gl.ONE;
			break;
		case 2:		// xor
			break;	// todo
		case 3:		// copy
			this_.srcBlend = gl.ONE;
			this_.destBlend = gl.ZERO;
			break;
		case 4:		// destination-over
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.ONE;
			break;
		case 5:		// source-in
			this_.srcBlend = gl.DST_ALPHA;
			this_.destBlend = gl.ZERO;
			break;
		case 6:		// destination-in
			this_.srcBlend = gl.ZERO;
			this_.destBlend = gl.SRC_ALPHA;
			break;
		case 7:		// source-out
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.ZERO;
			break;
		case 8:		// destination-out
			this_.srcBlend = gl.ZERO;
			this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 9:		// source-atop
			this_.srcBlend = gl.DST_ALPHA;
			this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 10:	// destination-atop
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.SRC_ALPHA;
			break;
		}
	};
	cr.round6dp = function (x)
	{
		return Math.round(x * 1000000) / 1000000;
	};
}());
var MatrixArray=typeof Float32Array!=="undefined"?Float32Array:Array,glMatrixArrayType=MatrixArray,vec3={},mat3={},mat4={},quat4={};vec3.create=function(a){var b=new MatrixArray(3);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2]);return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a===c)return a[0]+=b[0],a[1]+=b[1],a[2]+=b[2],a;c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a===c)return a[0]-=b[0],a[1]-=b[1],a[2]-=b[2],a;c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a===c)return a[0]*=b,a[1]*=b,a[2]*=b,a;c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g===1)return b[0]=c,b[1]=d,b[2]=e,b}else return b[0]=0,b[1]=0,b[2]=0,b;g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1],a=a[2],g=b[0],f=b[1],b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1],a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1],a=a[2]-b[2],b=Math.sqrt(d*d+e*e+a*a);if(!b)return c[0]=0,c[1]=0,c[2]=0,c;b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};
mat3.create=function(a){var b=new MatrixArray(9);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8]);return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[15]=1;b[14]=0;b[13]=0;b[12]=0;b[11]=0;b[10]=a[8];b[9]=a[7];b[8]=a[6];b[7]=0;b[6]=a[5];b[5]=a[4];b[4]=a[3];b[3]=0;b[2]=a[2];b[1]=a[1];b[0]=a[0];return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};mat4.create=function(a){var b=new MatrixArray(16);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8],b[9]=a[9],b[10]=a[10],b[11]=a[11],b[12]=a[12],b[13]=a[13],b[14]=a[14],b[15]=a[15]);return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],n=a[11],o=a[12],m=a[13],p=a[14],a=a[15];return o*k*h*e-j*m*h*e-o*f*l*e+g*m*l*e+j*f*p*e-g*k*p*e-o*k*d*i+j*m*d*i+o*c*l*i-b*m*l*i-j*c*p*i+b*k*p*i+o*f*d*n-g*m*d*n-o*c*h*n+b*m*h*n+g*c*p*n-b*f*p*n-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],n=a[10],o=a[11],m=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*m,y=k*r-n*m,z=k*s-o*m,C=l*r-n*p,D=l*s-o*p,E=n*s-o*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+n*v-o*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-m*w+r*t-s*B)*q;b[7]=(k*w-n*t+o*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(m*v-p*t+s*A)*q;b[11]=(-k*v+l*t-o*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-m*u+p*B-r*A)*q;b[15]=(k*u-l*B+n*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,n=-k*g+h*i,o=j*g-f*i,m=c*l+d*n+e*o;if(!m)return null;m=1/m;b||(b=mat3.create());b[0]=l*m;b[1]=(-k*d+e*j)*m;b[2]=(h*d-e*f)*m;b[3]=n*m;b[4]=(k*c-e*i)*m;b[5]=(-h*c+e*g)*m;b[6]=o*m;b[7]=(-j*c+d*i)*m;b[8]=(f*c-d*g)*m;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],n=a[9],o=a[10],m=a[11],p=a[12],r=a[13],s=a[14],a=a[15],A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14],b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*n+u*r;c[2]=A*g+B*j+t*o+u*s;c[3]=A*f+B*k+t*m+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*n+y*r;c[6]=v*g+w*j+x*o+y*s;c[7]=v*f+w*k+x*m+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*n+E*r;c[10]=z*g+C*
j+D*o+E*s;c[11]=z*f+C*k+D*m+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*n+b*r;c[14]=q*g+F*j+G*o+b*s;c[15]=q*f+F*k+G*m+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2],b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1],b=b[2],g,f,h,i,j,k,l,n,o,m,p,r;if(!c||a===c)return a[12]=a[0]*d+a[4]*e+a[8]*b+a[12],a[13]=a[1]*d+a[5]*e+a[9]*b+a[13],a[14]=a[2]*d+a[6]*e+a[10]*b+a[14],a[15]=a[3]*d+a[7]*e+a[11]*b+a[15],a;g=a[0];f=a[1];h=a[2];i=a[3];j=a[4];k=a[5];l=a[6];n=a[7];o=a[8];m=a[9];p=a[10];r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=n;c[8]=o;c[9]=m;c[10]=p;c[11]=r;c[12]=g*d+j*e+o*b+a[12];c[13]=f*d+k*e+m*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+n*e+r*b+a[15];
return c};mat4.scale=function(a,b,c){var d=b[0],e=b[1],b=b[2];if(!c||a===c)return a[0]*=d,a[1]*=d,a[2]*=d,a[3]*=d,a[4]*=e,a[5]*=e,a[6]*=e,a[7]*=e,a[8]*=b,a[9]*=b,a[10]*=b,a[11]*=b,a;c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1],c=c[2],f=Math.sqrt(e*e+g*g+c*c),h,i,j,k,l,n,o,m,p,r,s,A,B,t,u,v,w,x,y,z;if(!f)return null;f!==1&&(f=1/f,e*=f,g*=f,c*=f);h=Math.sin(b);i=Math.cos(b);j=1-i;b=a[0];f=a[1];k=a[2];l=a[3];n=a[4];o=a[5];m=a[6];p=a[7];r=a[8];s=a[9];A=a[10];B=a[11];t=e*e*j+i;u=g*e*j+c*h;v=c*e*j-g*h;w=e*g*j-c*h;x=g*g*j+i;y=c*g*j+e*h;z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;d?a!==d&&(d[12]=a[12],d[13]=a[13],d[14]=a[14],d[15]=a[15]):d=a;d[0]=b*t+n*u+r*v;d[1]=f*t+o*u+s*v;d[2]=k*t+m*u+A*
v;d[3]=l*t+p*u+B*v;d[4]=b*w+n*x+r*y;d[5]=f*w+o*x+s*y;d[6]=k*w+m*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+n*e+r*g;d[9]=f*z+o*e+s*g;d[10]=k*z+m*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];c?a!==c&&(c[0]=a[0],c[1]=a[1],c[2]=a[2],c[3]=a[3],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];c?a!==c&&(c[4]=a[4],c[5]=a[5],c[6]=a[6],c[7]=a[7],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];c?a!==c&&(c[8]=a[8],c[9]=a[9],c[10]=a[10],c[11]=a[11],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b*=a;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e,g,f,h,i,j,k,l,n=a[0],o=a[1],a=a[2];g=c[0];f=c[1];e=c[2];c=b[1];j=b[2];if(n===b[0]&&o===c&&a===j)return mat4.identity(d);c=n-b[0];j=o-b[1];k=a-b[2];l=1/Math.sqrt(c*c+j*j+k*k);c*=l;j*=l;k*=l;b=f*k-e*j;e=e*c-g*k;g=g*j-f*c;(l=Math.sqrt(b*b+e*e+g*g))?(l=1/l,b*=l,e*=l,g*=l):g=e=b=0;f=j*g-k*e;h=k*b-c*g;i=c*e-j*b;(l=Math.sqrt(f*f+h*h+i*i))?(l=1/l,f*=l,h*=l,i*=l):i=h=f=0;d[0]=b;d[1]=f;d[2]=c;d[3]=0;d[4]=e;d[5]=h;d[6]=j;d[7]=0;d[8]=g;d[9]=i;d[10]=k;d[11]=
0;d[12]=-(b*n+e*o+g*a);d[13]=-(f*n+h*o+i*a);d[14]=-(c*n+j*o+k*a);d[15]=1;return d};mat4.fromRotationTranslation=function(a,b,c){c||(c=mat4.create());var d=a[0],e=a[1],g=a[2],f=a[3],h=d+d,i=e+e,j=g+g,a=d*h,k=d*i;d*=j;var l=e*i;e*=j;g*=j;h*=f;i*=f;f*=j;c[0]=1-(l+g);c[1]=k+f;c[2]=d-i;c[3]=0;c[4]=k-f;c[5]=1-(a+g);c[6]=e+h;c[7]=0;c[8]=d+i;c[9]=e-h;c[10]=1-(a+l);c[11]=0;c[12]=b[0];c[13]=b[1];c[14]=b[2];c[15]=1;return c};
mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4.create=function(a){var b=new MatrixArray(4);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3]);return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a===b)return a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e)),a;b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a===b)return a[0]*=-1,a[1]*=-1,a[2]*=-1,a;b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2],a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f===0)return b[0]=0,b[1]=0,b[2]=0,b[3]=0,b;f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],a=a[3],f=b[0],h=b[1],i=b[2],b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2],b=a[0],f=a[1],h=a[2],a=a[3],i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d,d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c*=i;var l=d*h;d*=i;e*=i;f*=g;h*=g;g*=i;b[0]=1-(l+e);b[1]=k+g;b[2]=c-h;b[3]=k-g;b[4]=1-(j+e);b[5]=d+f;b[6]=c+h;b[7]=d-f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c*=i;var l=d*h;d*=i;e*=i;f*=g;h*=g;g*=i;b[0]=1-(l+e);b[1]=k+g;b[2]=c-h;b[3]=0;b[4]=k-g;b[5]=1-(j+e);b[6]=d+f;b[7]=0;b[8]=c+h;b[9]=d-f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
quat4.slerp=function(a,b,c,d){d||(d=a);var e=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3],g,f;if(Math.abs(e)>=1)return d!==a&&(d[0]=a[0],d[1]=a[1],d[2]=a[2],d[3]=a[3]),d;g=Math.acos(e);f=Math.sqrt(1-e*e);if(Math.abs(f)<0.001)return d[0]=a[0]*0.5+b[0]*0.5,d[1]=a[1]*0.5+b[1]*0.5,d[2]=a[2]*0.5+b[2]*0.5,d[3]=a[3]*0.5+b[3]*0.5,d;e=Math.sin((1-c)*g)/f;c=Math.sin(c*g)/f;d[0]=a[0]*e+b[0]*c;d[1]=a[1]*e+b[1]*c;d[2]=a[2]*e+b[2]*c;d[3]=a[3]*e+b[3]*c;return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};
(function()
{
	var MAX_VERTICES = 8000;						// equates to 2500 objects being drawn
	var MAX_INDICES = (MAX_VERTICES / 2) * 3;		// 6 indices for every 4 vertices
	var MAX_POINTS = 8000;
	var MULTI_BUFFERS = 4;							// cycle 4 buffers to try and avoid blocking
	var BATCH_NULL = 0;
	var BATCH_QUAD = 1;
	var BATCH_SETTEXTURE = 2;
	var BATCH_SETOPACITY = 3;
	var BATCH_SETBLEND = 4;
	var BATCH_UPDATEMODELVIEW = 5;
	var BATCH_RENDERTOTEXTURE = 6;
	var BATCH_CLEAR = 7;
	var BATCH_POINTS = 8;
	var BATCH_SETPROGRAM = 9;
	var BATCH_SETPROGRAMPARAMETERS = 10;
	function GLWrap_(gl, isMobile)
	{
		this.width = 0;		// not yet known, wait for call to setSize()
		this.height = 0;
		this.cam = vec3.create([0, 0, 100]);			// camera position
		this.look = vec3.create([0, 0, 0]);				// lookat position
		this.up = vec3.create([0, 1, 0]);				// up vector
		this.worldScale = vec3.create([1, 1, 1]);		// world scaling factor
		this.matP = mat4.create();						// perspective matrix
		this.matMV = mat4.create();						// model view matrix
		this.lastMV = mat4.create();
		this.currentMV = mat4.create();
		this.gl = gl;
		this.initState();
	};
	GLWrap_.prototype.initState = function ()
	{
		var gl = this.gl;
		var i, len;
		this.lastOpacity = 1;
		this.lastTexture = null;
		this.currentOpacity = 1;
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.disable(gl.CULL_FACE);
		gl.disable(gl.DEPTH_TEST);
		this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		this.lastSrcBlend = gl.ONE;
		this.lastDestBlend = gl.ONE_MINUS_SRC_ALPHA;
		this.pointBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
		this.vertexBuffers = new Array(MULTI_BUFFERS);
		this.texcoordBuffers = new Array(MULTI_BUFFERS);
		for (i = 0; i < MULTI_BUFFERS; i++)
		{
			this.vertexBuffers[i] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[i]);
			this.texcoordBuffers[i] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[i]);
		}
		this.curBuffer = 0;
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.vertexData = new Float32Array(MAX_VERTICES * 2);
		this.texcoordData = new Float32Array(MAX_VERTICES * 2);
		this.pointData = new Float32Array(MAX_POINTS * 4);
		var indexData = new Uint16Array(MAX_INDICES);
		i = 0, len = MAX_INDICES;
		var fv = 0;
		while (i < len)
		{
			indexData[i++] = fv;		// top left
			indexData[i++] = fv + 1;	// top right
			indexData[i++] = fv + 2;	// bottom right (first tri)
			indexData[i++] = fv;		// top left
			indexData[i++] = fv + 2;	// bottom right
			indexData[i++] = fv + 3;	// bottom left
			fv += 4;
		}
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
		this.vertexPtr = 0;
		this.pointPtr = 0;
		var fsSource, vsSource;
		this.shaderPrograms = [];
		fsSource = [
			"varying mediump vec2 vTex;",
			"uniform lowp float opacity;",
			"uniform lowp sampler2D samplerFront;",
			"void main(void) {",
			"	gl_FragColor = texture2D(samplerFront, vTex);",
			"	gl_FragColor *= opacity;",
			"}"
		].join("\n");
		vsSource = [
			"attribute highp vec2 aPos;",
			"attribute mediump vec2 aTex;",
			"varying mediump vec2 vTex;",
			"uniform highp mat4 matP;",
			"uniform highp mat4 matMV;",
			"void main(void) {",
			"	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);",
			"	vTex = aTex;",
			"}"
		].join("\n");
		var shaderProg = this.createShaderProgram({src: fsSource}, vsSource, "<default>");
;
		this.shaderPrograms.push(shaderProg);		// Default shader is always shader 0
		fsSource = [
			"uniform mediump sampler2D samplerFront;",
			"varying lowp float opacity;",
			"void main(void) {",
			"	gl_FragColor = texture2D(samplerFront, gl_PointCoord);",
			"	gl_FragColor *= opacity;",
			"}"
		].join("\n");
		var pointVsSource = [
			"attribute vec4 aPos;",
			"varying float opacity;",
			"uniform mat4 matP;",
			"uniform mat4 matMV;",
			"void main(void) {",
			"	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);",
			"	gl_PointSize = aPos.z;",
			"	opacity = aPos.w;",
			"}"
		].join("\n");
		shaderProg = this.createShaderProgram({src: fsSource}, pointVsSource, "<point>");
;
		this.shaderPrograms.push(shaderProg);		// Point shader is always shader 1
		for (var shader_name in cr.shaders)
		{
			if (cr.shaders.hasOwnProperty(shader_name))
				this.shaderPrograms.push(this.createShaderProgram(cr.shaders[shader_name], vsSource, shader_name));
		}
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.batch = [];
		this.batchPtr = 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.lastProgram = -1;				// start -1 so first switchProgram can do work
		this.currentProgram = -1;			// current program during batch execution
		this.currentShader = null;
		this.fbo = gl.createFramebuffer();
		this.renderToTex = null;
		this.tmpVec3 = vec3.create([0, 0, 0]);
;
;
		var pointsizes = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
		this.minPointSize = pointsizes[0];
		this.maxPointSize = pointsizes[1];
;
		this.switchProgram(0);
		cr.seal(this);
	};
	function GLShaderProgram(gl, shaderProgram, name)
	{
		this.gl = gl;
		this.shaderProgram = shaderProgram;
		this.name = name;
		this.locAPos = gl.getAttribLocation(shaderProgram, "aPos");
		this.locATex = gl.getAttribLocation(shaderProgram, "aTex");
		this.locMatP = gl.getUniformLocation(shaderProgram, "matP");
		this.locMatMV = gl.getUniformLocation(shaderProgram, "matMV");
		this.locOpacity = gl.getUniformLocation(shaderProgram, "opacity");
		this.locSamplerFront = gl.getUniformLocation(shaderProgram, "samplerFront");
		this.locSamplerBack = gl.getUniformLocation(shaderProgram, "samplerBack");
		this.locDestStart = gl.getUniformLocation(shaderProgram, "destStart");
		this.locDestEnd = gl.getUniformLocation(shaderProgram, "destEnd");
		this.locSeconds = gl.getUniformLocation(shaderProgram, "seconds");
		this.locPixelWidth = gl.getUniformLocation(shaderProgram, "pixelWidth");
		this.locPixelHeight = gl.getUniformLocation(shaderProgram, "pixelHeight");
		this.locLayerScale = gl.getUniformLocation(shaderProgram, "layerScale");
		if (this.locOpacity)
			gl.uniform1f(this.locOpacity, 1);
		if (this.locSamplerFront)
			gl.uniform1i(this.locSamplerFront, 0);
		if (this.locSamplerBack)
			gl.uniform1i(this.locSamplerBack, 1);
		if (this.locDestStart)
			gl.uniform2f(this.locDestStart, 0.0, 0.0);
		if (this.locDestEnd)
			gl.uniform2f(this.locDestEnd, 1.0, 1.0);
		this.hasCurrentMatMV = false;		// matMV needs updating
	};
	GLWrap_.prototype.createShaderProgram = function(shaderEntry, vsSource, name)
	{
		var gl = this.gl;
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, shaderEntry.src);
		gl.compileShader(fragmentShader);
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
		{
;
			gl.deleteShader(fragmentShader);
			return null;
		}
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vsSource);
		gl.compileShader(vertexShader);
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
		{
;
			gl.deleteShader(fragmentShader);
			gl.deleteShader(vertexShader);
			return null;
		}
		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, fragmentShader);
		gl.attachShader(shaderProgram, vertexShader);
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
		{
;
			gl.deleteShader(fragmentShader);
			gl.deleteShader(vertexShader);
			gl.deleteProgram(shaderProgram);
			return null;
		}
		gl.useProgram(shaderProgram);
		gl.validateProgram(shaderProgram);
;
		gl.deleteShader(fragmentShader);
		gl.deleteShader(vertexShader);
		var ret = new GLShaderProgram(gl, shaderProgram, name);
		ret.extendBoxHorizontal = shaderEntry.extendBoxHorizontal || 0;
		ret.extendBoxVertical = shaderEntry.extendBoxVertical || 0;
		ret.crossSampling = !!shaderEntry.crossSampling;
		ret.animated = !!shaderEntry.animated;
		ret.parameters = shaderEntry.parameters || [];
		var i, len;
		for (i = 0, len = ret.parameters.length; i < len; i++)
		{
			ret.parameters[i][1] = gl.getUniformLocation(shaderProgram, ret.parameters[i][0]);
			gl.uniform1f(ret.parameters[i][1], 0);
		}
		cr.seal(ret);
		return ret;
	};
	GLWrap_.prototype.getShaderIndex = function(name_)
	{
		var i, len;
		for (i = 0, len = this.shaderPrograms.length; i < len; i++)
		{
			if (this.shaderPrograms[i].name === name_)
				return i;
		}
		return -1;
	};
	GLWrap_.prototype.project = function (x, y, out)
	{
		var viewport = [0, 0, this.width, this.height];
		var mv = this.matMV;
		var proj = this.matP;
		var fTempo = [0, 0, 0, 0, 0, 0, 0, 0];
		fTempo[0] = mv[0]*x+mv[4]*y+mv[12];
		fTempo[1] = mv[1]*x+mv[5]*y+mv[13];
		fTempo[2] = mv[2]*x+mv[6]*y+mv[14];
		fTempo[3] = mv[3]*x+mv[7]*y+mv[15];
		fTempo[4] = proj[0]*fTempo[0]+proj[4]*fTempo[1]+proj[8]*fTempo[2]+proj[12]*fTempo[3];
		fTempo[5] = proj[1]*fTempo[0]+proj[5]*fTempo[1]+proj[9]*fTempo[2]+proj[13]*fTempo[3];
		fTempo[6] = proj[2]*fTempo[0]+proj[6]*fTempo[1]+proj[10]*fTempo[2]+proj[14]*fTempo[3];
		fTempo[7] = -fTempo[2];
		if(fTempo[7]===0.0)	//The w value
			return;
		fTempo[7]=1.0/fTempo[7];
		fTempo[4]*=fTempo[7];
		fTempo[5]*=fTempo[7];
		fTempo[6]*=fTempo[7];
		out[0]=(fTempo[4]*0.5+0.5)*viewport[2]+viewport[0];
		out[1]=(fTempo[5]*0.5+0.5)*viewport[3]+viewport[1];
	};
	GLWrap_.prototype.setSize = function(w, h, force)
	{
		if (this.width === w && this.height === h && !force)
			return;
		this.endBatch();
		this.width = w;
		this.height = h;
		this.gl.viewport(0, 0, w, h);
		mat4.perspective(45, w / h, 1, 1000, this.matP);
		mat4.lookAt(this.cam, this.look, this.up, this.matMV);
		var tl = [0, 0];
		var br = [0, 0];
		this.project(0, 0, tl);
		this.project(1, 1, br);
		this.worldScale[0] = 1 / (br[0] - tl[0]);
		this.worldScale[1] = -1 / (br[1] - tl[1]);
		var i, len, s;
		for (i = 0, len = this.shaderPrograms.length; i < len; i++)
		{
			s = this.shaderPrograms[i];
			s.hasCurrentMatMV = false;
			if (s.locMatP)
			{
				this.gl.useProgram(s.shaderProgram);
				this.gl.uniformMatrix4fv(s.locMatP, false, this.matP);
			}
		}
		this.gl.useProgram(this.shaderPrograms[this.lastProgram].shaderProgram);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.lastTexture = null;
	};
	GLWrap_.prototype.resetModelView = function ()
	{
		mat4.lookAt(this.cam, this.look, this.up, this.matMV);
		mat4.scale(this.matMV, this.worldScale);
	};
	GLWrap_.prototype.translate = function (x, y)
	{
		if (x === 0 && y === 0)
			return;
		this.tmpVec3[0] = x;// * this.worldScale[0];
		this.tmpVec3[1] = y;// * this.worldScale[1];
		this.tmpVec3[2] = 0;
		mat4.translate(this.matMV, this.tmpVec3);
	};
	GLWrap_.prototype.scale = function (x, y)
	{
		if (x === 1 && y === 1)
			return;
		this.tmpVec3[0] = x;
		this.tmpVec3[1] = y;
		this.tmpVec3[2] = 1;
		mat4.scale(this.matMV, this.tmpVec3);
	};
	GLWrap_.prototype.rotateZ = function (a)
	{
		if (a === 0)
			return;
		mat4.rotateZ(this.matMV, a);
	};
	GLWrap_.prototype.updateModelView = function()
	{
		var anydiff = false;
		for (var i = 0; i < 16; i++)
		{
			if (this.lastMV[i] !== this.matMV[i])
			{
				anydiff = true;
				break;
			}
		}
		if (!anydiff)
			return;
		var b = this.pushBatch();
		b.type = BATCH_UPDATEMODELVIEW;
		if (b.mat4param)
			mat4.set(this.matMV, b.mat4param);
		else
			b.mat4param = mat4.create(this.matMV);
		mat4.set(this.matMV, this.lastMV);
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	/*
	var debugBatch = false;
	jQuery(document).mousedown(
		function(info) {
			if (info.which === 2)
				debugBatch = true;
		}
	);
	*/
	function GLBatchJob(type_, glwrap_)
	{
		this.type = type_;
		this.glwrap = glwrap_;
		this.gl = glwrap_.gl;
		this.opacityParam = 0;		// for setOpacity()
		this.startIndex = 0;		// for quad()
		this.indexCount = 0;		// "
		this.texParam = null;		// for setTexture()
		this.mat4param = null;		// for updateModelView()
		this.shaderParams = [];		// for user parameters
		cr.seal(this);
	};
	GLBatchJob.prototype.doSetTexture = function ()
	{
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texParam);
	};
	GLBatchJob.prototype.doSetOpacity = function ()
	{
		var o = this.opacityParam;
		var glwrap = this.glwrap;
		glwrap.currentOpacity = o;
		var curProg = glwrap.currentShader;
		if (curProg.locOpacity)
			this.gl.uniform1f(curProg.locOpacity, o);
	};
	GLBatchJob.prototype.doQuad = function ()
	{
		this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, this.startIndex * 2);
	};
	GLBatchJob.prototype.doSetBlend = function ()
	{
		this.gl.blendFunc(this.startIndex, this.indexCount);
	};
	GLBatchJob.prototype.doUpdateModelView = function ()
	{
		var i, len, s, shaderPrograms = this.glwrap.shaderPrograms, currentProgram = this.glwrap.currentProgram;
		for (i = 0, len = shaderPrograms.length; i < len; i++)
		{
			s = shaderPrograms[i];
			if (i === currentProgram && s.locMatMV)
			{
				this.gl.uniformMatrix4fv(s.locMatMV, false, this.mat4param);
				s.hasCurrentMatMV = true;
			}
			else
				s.hasCurrentMatMV = false;
		}
		mat4.set(this.mat4param, this.glwrap.currentMV);
	};
	GLBatchJob.prototype.doRenderToTexture = function ()
	{
		var gl = this.gl;
		var glwrap = this.glwrap;
		if (this.texParam)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, glwrap.fbo);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texParam, 0);
;
		}
		else
		{
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	};
	GLBatchJob.prototype.doClear = function ()
	{
		var gl = this.gl;
		if (this.startIndex === 0)		// clear whole surface
		{
			gl.clearColor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
		else							// clear rectangle
		{
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(this.gl.COLOR_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
		}
	};
	GLBatchJob.prototype.doPoints = function ()
	{
		var gl = this.gl;
		var glwrap = this.glwrap;
		var s = glwrap.shaderPrograms[1];
		gl.useProgram(s.shaderProgram);
		if (!s.hasCurrentMatMV && s.locMatMV)
		{
			gl.uniformMatrix4fv(s.locMatMV, false, glwrap.currentMV);
			s.hasCurrentMatMV = true;
		}
		gl.enableVertexAttribArray(s.locAPos);
		gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.pointBuffer);
		gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, this.startIndex / 4, this.indexCount);
		s = glwrap.currentShader;
		gl.useProgram(s.shaderProgram);
		if (s.locAPos >= 0)
		{
			gl.enableVertexAttribArray(s.locAPos);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
		}
		if (s.locATex >= 0)
		{
			gl.enableVertexAttribArray(s.locATex);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
	};
	GLBatchJob.prototype.doSetProgram = function ()
	{
		var gl = this.gl;
		var glwrap = this.glwrap;
		var s = glwrap.shaderPrograms[this.startIndex];		// recycled param to save memory
		glwrap.currentProgram = this.startIndex;			// current batch program
		glwrap.currentShader = s;
		gl.useProgram(s.shaderProgram);						// switch to
		if (!s.hasCurrentMatMV && s.locMatMV)
		{
			gl.uniformMatrix4fv(s.locMatMV, false, glwrap.currentMV);
			s.hasCurrentMatMV = true;
		}
		if (s.locOpacity)
			gl.uniform1f(s.locOpacity, glwrap.currentOpacity);
		if (s.locAPos >= 0)
		{
			gl.enableVertexAttribArray(s.locAPos);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
		}
		if (s.locATex >= 0)
		{
			gl.enableVertexAttribArray(s.locATex);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
	}
	GLBatchJob.prototype.doSetProgramParameters = function ()
	{
		var i, len, s = this.glwrap.currentShader;
		var gl = this.gl;
		if (s.locSamplerBack)
		{
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.texParam);
			gl.activeTexture(gl.TEXTURE0);
		}
		if (s.locPixelWidth)
			gl.uniform1f(s.locPixelWidth, this.mat4param[0]);
		if (s.locPixelHeight)
			gl.uniform1f(s.locPixelHeight, this.mat4param[1]);
		if (s.locDestStart)
			gl.uniform2f(s.locDestStart, this.mat4param[2], this.mat4param[3]);
		if (s.locDestEnd)
			gl.uniform2f(s.locDestEnd, this.mat4param[4], this.mat4param[5]);
		if (s.locLayerScale)
			gl.uniform1f(s.locLayerScale, this.mat4param[6]);
		if (s.locSeconds)
			gl.uniform1f(s.locSeconds, cr.performance_now() / 1000.0);
		if (s.parameters.length)
		{
			for (i = 0, len = s.parameters.length; i < len; i++)
			{
				gl.uniform1f(s.parameters[i][1], this.shaderParams[i]);
			}
		}
	};
	GLWrap_.prototype.pushBatch = function ()
	{
		if (this.batchPtr === this.batch.length)
			this.batch.push(new GLBatchJob(BATCH_NULL, this));
		return this.batch[this.batchPtr++];
	};
	GLWrap_.prototype.endBatch = function ()
	{
		if (this.batchPtr === 0)
			return;
		if (this.gl.isContextLost())
			return;
		var gl = this.gl;
		if (this.pointPtr > 0)
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.pointData.subarray(0, this.pointPtr), gl.STREAM_DRAW);
			if (s && s.locAPos >= 0 && s.name === "<point>")
				gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
		}
		if (this.vertexPtr > 0)
		{
			var s = this.currentShader;
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[this.curBuffer]);
			gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexPtr), gl.STREAM_DRAW);
			if (s && s.locAPos >= 0 && s.name !== "<point>")
				gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[this.curBuffer]);
			gl.bufferData(gl.ARRAY_BUFFER, this.texcoordData.subarray(0, this.vertexPtr), gl.STREAM_DRAW);
			if (s && s.locATex >= 0 && s.name !== "<point>")
				gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
		var i, len, b;
		for (i = 0, len = this.batchPtr; i < len; i++)
		{
			b = this.batch[i];
			switch (b.type) {
			case BATCH_QUAD:
				b.doQuad();
				break;
			case BATCH_SETTEXTURE:
				b.doSetTexture();
				break;
			case BATCH_SETOPACITY:
				b.doSetOpacity();
				break;
			case BATCH_SETBLEND:
				b.doSetBlend();
				break;
			case BATCH_UPDATEMODELVIEW:
				b.doUpdateModelView();
				break;
			case BATCH_RENDERTOTEXTURE:
				b.doRenderToTexture();
				break;
			case BATCH_CLEAR:
				b.doClear();
				break;
			case BATCH_POINTS:
				b.doPoints();
				break;
			case BATCH_SETPROGRAM:
				b.doSetProgram();
				break;
			case BATCH_SETPROGRAMPARAMETERS:
				b.doSetProgramParameters();
				break;
			}
		}
		this.batchPtr = 0;
		this.vertexPtr = 0;
		this.pointPtr = 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.curBuffer++;
		if (this.curBuffer >= MULTI_BUFFERS)
			this.curBuffer = 0;
	};
	GLWrap_.prototype.setOpacity = function (op)
	{
		if (op === this.lastOpacity)
			return;
		var b = this.pushBatch();
		b.type = BATCH_SETOPACITY;
		b.opacityParam = op;
		this.lastOpacity = op;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setTexture = function (tex)
	{
		if (tex === this.lastTexture)
			return;
		var b = this.pushBatch();
		b.type = BATCH_SETTEXTURE;
		b.texParam = tex;
		this.lastTexture = tex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setBlend = function (s, d)
	{
		if (s === this.lastSrcBlend && d === this.lastDestBlend)
			return;
		var b = this.pushBatch();
		b.type = BATCH_SETBLEND;
		b.startIndex = s;		// recycle params to save memory
		b.indexCount = d;
		this.lastSrcBlend = s;
		this.lastDestBlend = d;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setAlphaBlend = function ()
	{
		this.setBlend(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
	};
	var LAST_VERTEX = MAX_VERTICES * 2 - 8;
	GLWrap_.prototype.quad = function(tlx, tly, trx, try_, brx, bry, blx, bly)
	{
		if (this.vertexPtr >= LAST_VERTEX)
			this.endBatch();
		var v = this.vertexPtr;			// vertex cursor
		var vd = this.vertexData;		// vertex data array
		var td = this.texcoordData;		// texture coord data array
		if (this.hasQuadBatchTop)
		{
			this.batch[this.batchPtr - 1].indexCount += 6;
		}
		else
		{
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = (v / 4) * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false;
		}
		vd[v] = tlx;
		td[v++] = 0;
		vd[v] = tly;
		td[v++] = 0;
		vd[v] = trx;
		td[v++] = 1;
		vd[v] = try_;
		td[v++] = 0;
		vd[v] = brx;
		td[v++] = 1;
		vd[v] = bry;
		td[v++] = 1;
		vd[v] = blx;
		td[v++] = 0;
		vd[v] = bly;
		td[v++] = 1;
		this.vertexPtr = v;
	};
	GLWrap_.prototype.quadTex = function(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex)
	{
		if (this.vertexPtr >= LAST_VERTEX)
			this.endBatch();
		var v = this.vertexPtr;			// vertex cursor
		var vd = this.vertexData;		// vertex data array
		var td = this.texcoordData;		// texture coord data array
		if (this.hasQuadBatchTop)
		{
			this.batch[this.batchPtr - 1].indexCount += 6;
		}
		else
		{
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = (v / 4) * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false;
		}
		vd[v] = tlx;
		td[v++] = rcTex.left;
		vd[v] = tly;
		td[v++] = rcTex.top;
		vd[v] = trx;
		td[v++] = rcTex.right;
		vd[v] = try_;
		td[v++] = rcTex.top;
		vd[v] = brx;
		td[v++] = rcTex.right;
		vd[v] = bry;
		td[v++] = rcTex.bottom;
		vd[v] = blx;
		td[v++] = rcTex.left;
		vd[v] = bly;
		td[v++] = rcTex.bottom;
		this.vertexPtr = v;
	};
	var LAST_POINT = MAX_POINTS - 4;
	GLWrap_.prototype.point = function(x_, y_, size_, opacity_)
	{
		if (this.pointPtr >= LAST_POINT)
			this.endBatch();
		var p = this.pointPtr;			// point cursor
		var pd = this.pointData;		// point data array
		if (this.hasPointBatchTop)
		{
			this.batch[this.batchPtr - 1].indexCount++;
		}
		else
		{
			var b = this.pushBatch();
			b.type = BATCH_POINTS;
			b.startIndex = p;
			b.indexCount = 1;
			this.hasPointBatchTop = true;
			this.hasQuadBatchTop = false;
		}
		pd[p++] = x_;
		pd[p++] = y_;
		pd[p++] = size_;
		pd[p++] = opacity_;
		this.pointPtr = p;
	};
	GLWrap_.prototype.switchProgram = function (progIndex)
	{
		if (this.lastProgram === progIndex)
			return;			// no change
		var shaderProg = this.shaderPrograms[progIndex];
		if (!shaderProg)
		{
			if (this.lastProgram === 0)
				return;								// already on default shader
			progIndex = 0;
			shaderProg = this.shaderPrograms[0];
		}
		var b = this.pushBatch();
		b.type = BATCH_SETPROGRAM;
		b.startIndex = progIndex;
		this.lastProgram = progIndex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.programUsesDest = function (progIndex)
	{
		var s = this.shaderPrograms[progIndex];
		return !!(s.locDestStart || s.locDestEnd);
	};
	GLWrap_.prototype.programUsesCrossSampling = function (progIndex)
	{
		return this.shaderPrograms[progIndex].crossSampling;
	};
	GLWrap_.prototype.programExtendsBox = function (progIndex)
	{
		var s = this.shaderPrograms[progIndex];
		return s.extendBoxHorizontal !== 0 || s.extendBoxVertical !== 0;
	};
	GLWrap_.prototype.getProgramBoxExtendHorizontal = function (progIndex)
	{
		return this.shaderPrograms[progIndex].extendBoxHorizontal;
	};
	GLWrap_.prototype.getProgramBoxExtendVertical = function (progIndex)
	{
		return this.shaderPrograms[progIndex].extendBoxVertical;
	};
	GLWrap_.prototype.getProgramParameterType = function (progIndex, paramIndex)
	{
		return this.shaderPrograms[progIndex].parameters[paramIndex][2];
	};
	GLWrap_.prototype.programIsAnimated = function (progIndex)
	{
		return this.shaderPrograms[progIndex].animated;
	};
	GLWrap_.prototype.setProgramParameters = function (backTex, pixelWidth, pixelHeight, destStartX, destStartY, destEndX, destEndY, layerScale, params)
	{
		var i, len, s = this.shaderPrograms[this.lastProgram];
		if (s.locPixelWidth || s.locPixelHeight || s.locSeconds || s.locSamplerBack ||
			s.locDestStart || s.locDestEnd || s.locLayerScale || params.length)
		{
			var b = this.pushBatch();
			b.type = BATCH_SETPROGRAMPARAMETERS;
			if (b.mat4param)
				mat4.set(this.matMV, b.mat4param);
			else
				b.mat4param = mat4.create();
			b.mat4param[0] = pixelWidth;
			b.mat4param[1] = pixelHeight;
			b.mat4param[2] = destStartX;
			b.mat4param[3] = destStartY;
			b.mat4param[4] = destEndX;
			b.mat4param[5] = destEndY;
			b.mat4param[6] = layerScale;
			b.texParam = backTex;
			if (params.length)
			{
				b.shaderParams.length = params.length;
				for (i = 0, len = params.length; i < len; i++)
					b.shaderParams[i] = params[i];
			}
			this.hasQuadBatchTop = false;
			this.hasPointBatchTop = false;
		}
	};
	GLWrap_.prototype.clear = function (r, g, b_, a)
	{
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 0;					// clear all mode
		if (!b.mat4param)
			b.mat4param = mat4.create();
		b.mat4param[0] = r;
		b.mat4param[1] = g;
		b.mat4param[2] = b_;
		b.mat4param[3] = a;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.clearRect = function (x, y, w, h)
	{
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 1;					// clear rect mode
		if (!b.mat4param)
			b.mat4param = mat4.create();
		b.mat4param[0] = x;
		b.mat4param[1] = y;
		b.mat4param[2] = w;
		b.mat4param[3] = h;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.present = function ()
	{
		this.endBatch();
		this.gl.flush();
		/*
		if (debugBatch)
		{
;
			debugBatch = false;
		}
		*/
	};
	function nextHighestPowerOfTwo(x) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | x >> i;
		}
		return x + 1;
	}
	var all_textures = [];
	var BF_RGBA8 = 0;
	var BF_RGB8 = 1;
	var BF_RGBA4 = 2;
	var BF_RGB5_A1 = 3;
	var BF_RGB565 = 4;
	GLWrap_.prototype.loadTexture = function (img, tiling, linearsampling, pixelformat)
	{
		this.endBatch();
;
		var gl = this.gl;
		var isPOT = (cr.isPOT(img.width) && cr.isPOT(img.height));
		var webGL_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
		gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"], true);
		var internalformat = gl.RGBA;
		var format = gl.RGBA;
		var type = gl.UNSIGNED_BYTE;
		if (pixelformat)
		{
			switch (pixelformat) {
			case BF_RGB8:
				internalformat = gl.RGB;
				format = gl.RGB;
				break;
			case BF_RGBA4:
				type = gl.UNSIGNED_SHORT_4_4_4_4;
				break;
			case BF_RGB5_A1:
				type = gl.UNSIGNED_SHORT_5_5_5_1;
				break;
			case BF_RGB565:
				internalformat = gl.RGB;
				format = gl.RGB;
				type = gl.UNSIGNED_SHORT_5_6_5;
				break;
			}
		}
		if (!isPOT && tiling)
		{
			var canvas = document.createElement("canvas");
			canvas.width = nextHighestPowerOfTwo(img.width);
			canvas.height = nextHighestPowerOfTwo(img.height);
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img,
						  0, 0, img.width, img.height,
						  0, 0, canvas.width, canvas.height);
			gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, format, type, canvas);
		}
		else
			gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, format, type, img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, tiling ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, tiling ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		if (linearsampling)
		{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			if (isPOT)
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				gl.generateMipmap(gl.TEXTURE_2D);
			}
			else
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
		else
		{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture = null;
		webGL_texture.c2width = img.width;
		webGL_texture.c2height = img.height;
		all_textures.push(webGL_texture);
		return webGL_texture;
	};
	GLWrap_.prototype.createEmptyTexture = function (w, h, linearsampling, _16bit)
	{
		this.endBatch();
		var gl = this.gl;
		var webGL_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, _16bit ? gl.UNSIGNED_SHORT_4_4_4_4 : gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture = null;
		webGL_texture.c2width = w;
		webGL_texture.c2height = h;
		all_textures.push(webGL_texture);
		return webGL_texture;
	};
	GLWrap_.prototype.videoToTexture = function (video_, texture_, _16bit)
	{
		this.endBatch();
		var gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, texture_);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, _16bit ? gl.UNSIGNED_SHORT_4_4_4_4 : gl.UNSIGNED_BYTE, video_);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture = null;
	};
	GLWrap_.prototype.deleteTexture = function (tex)
	{
		this.endBatch();
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.lastTexture = null;
		this.gl.deleteTexture(tex);
		cr.arrayFindRemove(all_textures, tex);
	};
	GLWrap_.prototype.estimateVRAM = function ()
	{
		var total = 0;
		var i, len, t;
		for (i = 0, len = all_textures.length; i < len; i++)
		{
			t = all_textures[i];
			total += (t.c2width * t.c2height * 4);
		}
		return total;
	};
	GLWrap_.prototype.textureCount = function ()
	{
		return all_textures.length;
	};
	GLWrap_.prototype.setRenderingToTexture = function (tex)
	{
		if (tex === this.renderToTex)
			return;
		var b = this.pushBatch();
		b.type = BATCH_RENDERTOTEXTURE;
		b.texParam = tex;
		this.renderToTex = tex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	cr.GLWrap = GLWrap_;
}());
;
(function()
{
	function Runtime(canvas)
	{
		if (!canvas || (!canvas.getContext && !canvas["dc"]))
			return;
		if (canvas["c2runtime"])
			return;
		else
			canvas["c2runtime"] = this;
		var self = this;
		this.isPhoneGap = (typeof window["device"] !== "undefined" && (typeof window["device"]["cordova"] !== "undefined" || typeof window["device"]["phonegap"] !== "undefined"));
		this.isDirectCanvas = !!canvas["dc"];
		this.isAppMobi = (typeof window["AppMobi"] !== "undefined" || this.isDirectCanvas);
		this.isCocoonJs = !!window["c2cocoonjs"];
		if (this.isCocoonJs)
		{
			CocoonJS["App"]["onSuspended"].addEventListener(function() {
				self.setSuspended(true);
			});
			CocoonJS["App"]["onActivated"].addEventListener(function () {
				self.setSuspended(false);
			});
		}
		this.isDomFree = this.isDirectCanvas || this.isCocoonJs;
		this.isAndroid = /android/i.test(navigator.userAgent);
		this.isIE = /msie/i.test(navigator.userAgent);
		this.isiPhone = /iphone/i.test(navigator.userAgent) || /ipod/i.test(navigator.userAgent);	// treat ipod as an iphone
		this.isiPad = /ipad/i.test(navigator.userAgent);
		this.isiOS = this.isiPhone || this.isiPad;
		this.isChrome = /chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent);
		this.isSafari = !this.isChrome && /safari/i.test(navigator.userAgent);		// Chrome includes Safari in UA
		this.isWindows = /windows/i.test(navigator.userAgent);
		this.isAwesomium = /awesomium/i.test(navigator.userAgent);
		this.isArcade = (typeof window["is_scirra_arcade"] !== "undefined");
		this.devicePixelRatio = 1;
		this.isMobile = (this.isPhoneGap || this.isAppMobi || this.isCocoonJs || this.isAndroid || this.isiOS);
		if (!this.isMobile)
			this.isMobile = /(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet)/i.test(navigator.userAgent);
		this.canvas = canvas;
		this.canvasdiv = document.getElementById("c2canvasdiv");
		this.gl = null;
		this.glwrap = null;
		this.ctx = null;
		this.canvas.oncontextmenu = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
		this.canvas.onselectstart = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
		if (this.isDirectCanvas)
			window["c2runtime"] = this;
		this.width = canvas.width;
		this.height = canvas.height;
		this.lastwidth = this.width;
		this.lastheight = this.height;
		this.redraw = true;
		this.isSuspended = false;
		if (!Date.now) {
		  Date.now = function now() {
			return +new Date();
		  };
		}
		this.plugins = [];
		this.types = {};
		this.types_by_index = [];
		this.behaviors = [];
		this.layouts = {};
		this.layouts_by_index = [];
		this.eventsheets = {};
		this.eventsheets_by_index = [];
		this.wait_for_textures = [];        // for blocking until textures loaded
		this.triggers_to_postinit = [];
		this.all_global_vars = [];
		this.deathRow = new cr.ObjectSet();
		this.isInClearDeathRow = false;
		this.isInOnDestroy = 0;					// needs to support recursion so increments and decrements and is true if > 0
		this.isRunningEvents = false;
		this.createRow = [];
		this.dt = 0;
        this.dt1 = 0;
		this.logictime = 0;			// used to calculate CPUUtilisation
		this.cpuutilisation = 0;
		this.zeroDtCount = 0;
        this.timescale = 1.0;
        this.kahanTime = new cr.KahanAdder();
		this.last_tick_time = 0;
		this.measuring_dt = true;
		this.fps = 0;
		this.last_fps_time = 0;
		this.tickcount = 0;
		this.execcount = 0;
		this.framecount = 0;        // for fps
		this.objectcount = 0;
		this.changelayout = null;
		this.destroycallbacks = [];
		this.event_stack = [];
		this.event_stack_index = -1;
		this.localvar_stack = [[]];
		this.localvar_stack_index = 0;
		this.trigger_depth = 0;		// recursion depth for triggers
		this.pushEventStack(null);
		this.loop_stack = [];
		this.loop_stack_index = -1;
		this.next_uid = 0;
		this.layout_first_tick = true;
		this.family_count = 0;
		this.suspend_events = [];
		this.raf_id = 0;
		this.timeout_id = 0;
		this.isloading = true;
		this.loadingprogress = 0;
		this.isAwesomiumFullscreen = false;
		this.stackLocalCount = 0;	// number of stack-based local vars for recursion
		this.had_a_click = false;
        this.objects_to_tick = new cr.ObjectSet();
		this.objects_to_tick2 = new cr.ObjectSet();
		this.registered_collisions = [];
		this.temp_poly = new cr.CollisionPoly([]);
		this.temp_poly2 = new cr.CollisionPoly([]);
		this.allGroups = [];				// array of all event groups
        this.activeGroups = {};				// event group activation states
		this.running_layout = null;			// currently running layout
		this.layer_canvas = null;			// for layers "render-to-texture"
		this.layer_ctx = null;
		this.layer_tex = null;
		this.layout_tex = null;
		this.is_WebGL_context_lost = false;
		this.uses_background_blending = false;	// if any shader uses background blending, so entire layout renders to texture
		this.fx_tex = [null, null];
		this.fullscreen_scaling = 0;
		this.files_subfolder = "";			// path with project files
		this.loaderlogo = null;
		this.snapshotCanvas = null;
		this.snapshotData = "";
		this.load();
		var isiOSRetina = (!this.isDomFree && this.useiOSRetina && this.isiOS);
		this.devicePixelRatio = (isiOSRetina ? (window["devicePixelRatio"] || 1) : 1);
		this.ClearDeathRow();
		var attribs;
		if (typeof jQuery !== "undefined" && this.fullscreen_mode > 0)
			this["setSize"](jQuery(window).width(), jQuery(window).height());
		try {
			if (this.enableWebGL && !this.isDomFree)
			{
				attribs = { "depth": false, "antialias": !this.isMobile };
				var use_webgl = true;
				if (this.isChrome && this.isWindows)
				{
					var tempcanvas = document.createElement("canvas");
					var tempgl = (tempcanvas.getContext("webgl", attribs) || tempcanvas.getContext("experimental-webgl", attribs));
					if (tempgl.getSupportedExtensions().toString() === "OES_texture_float,OES_standard_derivatives,WEBKIT_WEBGL_lose_context")
					{
;
						use_webgl = false;
					}
				}
				if (use_webgl)
					this.gl = (canvas.getContext("webgl", attribs) || canvas.getContext("experimental-webgl", attribs));
			}
		}
		catch (e) {
		}
		if (this.gl)
		{
;
			this.overlay_canvas = document.createElement("canvas");
			jQuery(this.overlay_canvas).appendTo(this.canvas.parentNode);
			this.overlay_canvas.oncontextmenu = function (e) { return false; };
			this.overlay_canvas.onselectstart = function (e) { return false; };
			this.overlay_canvas.width = canvas.width;
			this.overlay_canvas.height = canvas.height;
			this.positionOverlayCanvas();
			this.overlay_ctx = this.overlay_canvas.getContext("2d");
			this.glwrap = new cr.GLWrap(this.gl, this.isMobile);
			this.glwrap.setSize(canvas.width, canvas.height);
			this.ctx = null;
			this.canvas.addEventListener("webglcontextlost", function (ev) {
				console.log("WebGL context lost");
				ev.preventDefault();
				self.onContextLost();
				window["cr_setSuspended"](true);		// stop rendering
			}, false);
			this.canvas.addEventListener("webglcontextrestored", function (ev) {
				console.log("WebGL context restored");
				self.glwrap.initState();
				self.glwrap.setSize(self.glwrap.width, self.glwrap.height, true);
				self.layer_tex = null;
				self.layout_tex = null;
				self.fx_tex[0] = null;
				self.fx_tex[1] = null;
				self.onContextRestored();
				self.redraw = true;
				window["cr_setSuspended"](false);		// resume rendering
			}, false);
			var i, len, j, lenj, k, lenk, t, s, l, y;
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
				{
					s = t.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
					this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
				}
			}
			for (i = 0, len = this.layouts_by_index.length; i < len; i++)
			{
				l = this.layouts_by_index[i];
				for (j = 0, lenj = l.effect_types.length; j < lenj; j++)
				{
					s = l.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
				}
				for (j = 0, lenj = l.layers.length; j < lenj; j++)
				{
					y = l.layers[j];
					for (k = 0, lenk = y.effect_types.length; k < lenk; k++)
					{
						s = y.effect_types[k];
						s.shaderindex = this.glwrap.getShaderIndex(s.id);
						this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
					}
				}
			}
		}
		else
		{
			if (this.fullscreen_mode > 0 && this.isDirectCanvas)
			{
;
				this.canvas = null;
				document.oncontextmenu = function (e) { return false; };
				document.onselectstart = function (e) { return false; };
				this.ctx = AppMobi["canvas"]["getContext"]("2d");
				try {
					this.ctx["samplingMode"] = this.linearSampling ? "smooth" : "sharp";
					this.ctx["globalScale"] = 1;
					this.ctx["HTML5CompatibilityMode"] = true;
				} catch(e){}
				if (this.width !== 0 && this.height !== 0)
				{
					this.ctx.width = this.width;
					this.ctx.height = this.height;
				}
			}
			if (!this.ctx)
			{
;
				if (this.isCocoonJs)
				{
					attribs = { "antialias" : !!this.linearSampling };
					this.ctx = canvas.getContext("2d", attribs);
				}
				else
					this.ctx = canvas.getContext("2d");
				this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["imageSmoothingEnabled"] = this.linearSampling;
			}
			this.overlay_canvas = null;
			this.overlay_ctx = null;
		}
		this.tickFunc = (function (self) { return function () { self.tick(); }; })(this);
		this.go();			// run loading screen
		this.extra = {};
		cr.seal(this);
	};
	var webkitRepaintFlag = false;
	Runtime.prototype["setSize"] = function (w, h)
	{
		var tryHideAddressBar = this.hideAddressBar && this.isiPhone && !navigator["standalone"] && !this.isDomFree && !this.isPhoneGap;
		var addressBarHeight = 0;
		if (tryHideAddressBar)
		{
			if (this.isiPhone)
				addressBarHeight = 60;
			else if (this.isAndroid)
				addressBarHeight = 56;
			h += addressBarHeight;
		}
		var offx = 0, offy = 0;
		var neww = 0, newh = 0, intscale = 0;
		var mode = this.fullscreen_mode;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
		if (isfullscreen && this.fullscreen_scaling > 0)
			mode = this.fullscreen_scaling;
		if (mode >= 3)
		{
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = w / h;
			if (cur_aspect > orig_aspect)
			{
				neww = h * orig_aspect;
				if (mode === 4)	// integer scaling
				{
					intscale = neww / this.original_width;
					if (intscale > 1)
						intscale = Math.floor(intscale);
					else if (intscale < 1)
						intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale;
					newh = this.original_height * intscale;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh;
				}
				else
				{
					offx = (w - neww) / 2;
					w = neww;
				}
			}
			else
			{
				newh = w / orig_aspect;
				if (mode === 4)	// integer scaling
				{
					intscale = newh / this.original_height;
					if (intscale > 1)
						intscale = Math.floor(intscale);
					else if (intscale < 1)
						intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale;
					newh = this.original_height * intscale;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh;
				}
				else
				{
					offy = (h - newh) / 2;
					h = newh;
				}
			}
			if (isfullscreen && !this.isAwesomium)
			{
				offx = 0;
				offy = 0;
			}
			offx = Math.floor(offx);
			offy = Math.floor(offy);
			w = Math.floor(w);
			h = Math.floor(h);
		}
		else if (this.isAwesomium && this.isAwesomiumFullscreen && this.fullscreen_mode_set === 0)
		{
			offx = Math.floor((w - this.original_width) / 2);
			offy = Math.floor((h - this.original_height) / 2);
			w = this.original_width;
			h = this.original_height;
		}
		var isiOSRetina = (!this.isDomFree && this.useiOSRetina && this.isiOS);
		if (isiOSRetina && this.isiPad && this.devicePixelRatio > 1)	// don't apply to iPad 1-2
		{
			if (w >= 1024)
				w = 1023;		// 2046 retina pixels
			if (h >= 1024)
				h = 1023;
		}
		var multiplier = this.devicePixelRatio;
		this.width = w * multiplier;
		this.height = h * multiplier;
		this.redraw = true;
		if (this.canvasdiv && !this.isDomFree)
		{
			jQuery(this.canvasdiv).css({"width": w + "px",
										"height": h + "px",
										"margin-left": offx,
										"margin-top": offy});
			if (typeof cr_is_preview !== "undefined")
			{
				jQuery("#borderwrap").css({"width": w + "px",
											"height": h + "px"});
			}
		}
		if (this.canvas)
		{
			this.canvas.width = w * multiplier;
			this.canvas.height = h * multiplier;
			if (isiOSRetina)
			{
				jQuery(this.canvas).css({"width": w + "px",
										"height": h + "px"});
			}
		}
		if (this.overlay_canvas)
		{
			this.overlay_canvas.width = w;
			this.overlay_canvas.height = h;
		}
		if (this.glwrap)
			this.glwrap.setSize(w, h);
		if (this.isDirectCanvas && this.ctx)
		{
			this.ctx.width = w;
			this.ctx.height = h;
		}
		if (this.ctx)
		{
			this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["imageSmoothingEnabled"] = this.linearSampling;
		}
		/*
		if (!this.isDomFree && this.canvas && /webkit/i.test(navigator.userAgent) && !this.isAwesomium)
		{
			var this_ = this;
			window.setTimeout(function () {
				if (webkitRepaintFlag)
					return;
				webkitRepaintFlag = true;
				var n = document.createTextNode(".");
				this_.canvas.parentElement.insertBefore(n, this_.canvas);
				window.setTimeout(function () {
					this_.canvas.parentElement.removeChild(n);
					webkitRepaintFlag = false;
				}, 33);
			}, 33);
		}
		*/
		if (tryHideAddressBar && addressBarHeight > 0)
		{
			window.setTimeout(function () {
				window.scrollTo(0, 1);
			}, 100);
		}
	};
	Runtime.prototype.onContextLost = function ()
	{
		this.is_WebGL_context_lost = true;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			t = this.types_by_index[i];
			if (t.onLostWebGLContext)
				t.onLostWebGLContext();
		}
	};
	Runtime.prototype.onContextRestored = function ()
	{
		this.is_WebGL_context_lost = false;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			t = this.types_by_index[i];
			if (t.onRestoreWebGLContext)
				t.onRestoreWebGLContext();
		}
	};
	Runtime.prototype.positionOverlayCanvas = function()
	{
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
		var overlay_position = isfullscreen ? jQuery(this.canvas).offset() : jQuery(this.canvas).position();
		overlay_position.position = "absolute";
		jQuery(this.overlay_canvas).css(overlay_position);
	};
	var caf = window["cancelAnimationFrame"] ||
	  window["mozCancelAnimationFrame"]    ||
	  window["webkitCancelAnimationFrame"] ||
	  window["msCancelAnimationFrame"]     ||
	  window["oCancelAnimationFrame"];
	Runtime.prototype["setSuspended"] = function (s)
	{
		var i, len;
		if (s && !this.isSuspended)
		{
			this.isSuspended = true;			// next tick will be last
			if (this.raf_id !== 0 && caf)		// note: CocoonJS does not implement cancelAnimationFrame
				caf(this.raf_id);
			if (this.timeout_id !== 0)
				clearTimeout(this.timeout_id);
			for (i = 0, len = this.suspend_events.length; i < len; i++)
				this.suspend_events[i](true);
		}
		else if (!s && this.isSuspended)
		{
			this.isSuspended = false;
			this.last_tick_time = cr.performance_now();	// ensure first tick is a zero-dt one
			this.last_fps_time = cr.performance_now();	// reset FPS counter
			this.framecount = 0;
			for (i = 0, len = this.suspend_events.length; i < len; i++)
				this.suspend_events[i](false);
			this.tick();						// kick off runtime again
		}
	};
	Runtime.prototype.addSuspendCallback = function (f)
	{
		this.suspend_events.push(f);
	};
	Runtime.prototype.load = function ()
	{
;
		var pm = cr.getProjectModel();
		this.name = pm[0];
		this.first_layout = pm[1];
		this.fullscreen_mode = pm[11];	// 0 = off, 1 = crop, 2 = scale, 3 = letterbox scale, 4 = integer letterbox scale
		this.fullscreen_mode_set = pm[11];
		if (this.isDomFree && pm[11] >= 3)
		{
			cr.logexport("[Construct 2] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale'");
			this.fullscreen_mode = 2;
			this.fullscreen_mode_set = 2;
		}
		this.uses_loader_layout = pm[17];
		this.loaderstyle = pm[18];
		if (this.loaderstyle === 0)
		{
			this.loaderlogo = new Image();
			this.loaderlogo.src = "logo.png";
		}
		this.system = new cr.system_object(this);
		var i, len, j, lenj, k, lenk, idstr, m, b, t, f;
		var plugin, plugin_ctor;
		for (i = 0, len = pm[2].length; i < len; i++)
		{
			m = pm[2][i];
;
			cr.add_common_aces(m);
			plugin = new m[0](this);
			plugin.singleglobal = m[1];
			plugin.is_world = m[2];
			plugin.must_predraw = m[9];
			if (plugin.onCreate)
				plugin.onCreate();  // opportunity to override default ACEs
			cr.seal(plugin);
			this.plugins.push(plugin);
		}
		pm = cr.getProjectModel();
		for (i = 0, len = pm[3].length; i < len; i++)
		{
			m = pm[3][i];
			plugin_ctor = m[1];
;
			plugin = null;
			for (j = 0, lenj = this.plugins.length; j < lenj; j++)
			{
				if (this.plugins[j] instanceof plugin_ctor)
				{
					plugin = this.plugins[j];
					break;
				}
			}
;
;
			var type_inst = new plugin.Type(plugin);
;
			type_inst.name = m[0];
			type_inst.is_family = m[2];
			type_inst.vars_count = m[3];
			type_inst.behs_count = m[4];
			type_inst.fx_count = m[5];
			if (type_inst.is_family)
			{
				type_inst.members = [];				// types in this family
				type_inst.family_index = this.family_count++;
				type_inst.families = null;
			}
			else
			{
				type_inst.members = null;
				type_inst.family_index = -1;
				type_inst.families = [];			// families this type belongs to
			}
			type_inst.family_var_map = null;
			type_inst.family_beh_map = null;
			type_inst.family_fx_map = null;
			type_inst.is_contained = false;
			type_inst.container = null;
			if (m[6])
			{
				type_inst.texture_file = m[6][0];
				type_inst.texture_filesize = m[6][1];
				type_inst.texture_pixelformat = m[6][2];
			}
			else
			{
				type_inst.texture_file = null;
				type_inst.texture_filesize = 0;
				type_inst.texture_pixelformat = 0;		// rgba8
			}
			if (m[7])
			{
				type_inst.animations = m[7];
			}
			else
			{
				type_inst.animations = null;
			}
			type_inst.index = i;                                // save index in to types array in type
			type_inst.instances = [];                           // all instances of this type
			type_inst.deadCache = [];							// destroyed instances to recycle next create
			type_inst.solstack = [new cr.selection(type_inst)]; // initialise SOL stack with one empty SOL
			type_inst.cur_sol = 0;
			type_inst.default_instance = null;
			type_inst.stale_iids = true;
			type_inst.updateIIDs = cr.type_updateIIDs;
			type_inst.getFirstPicked = cr.type_getFirstPicked;
			type_inst.getPairedInstance = cr.type_getPairedInstance;
			type_inst.getCurrentSol = cr.type_getCurrentSol;
			type_inst.pushCleanSol = cr.type_pushCleanSol;
			type_inst.pushCopySol = cr.type_pushCopySol;
			type_inst.popSol = cr.type_popSol;
			type_inst.getBehaviorByName = cr.type_getBehaviorByName;
			type_inst.getBehaviorIndexByName = cr.type_getBehaviorIndexByName;
			type_inst.getEffectIndexByName = cr.type_getEffectIndexByName;
			type_inst.applySolToContainer = cr.type_applySolToContainer;
			type_inst.extra = {};
			type_inst.toString = cr.type_toString;
			type_inst.behaviors = [];
			for (j = 0, lenj = m[8].length; j < lenj; j++)
			{
				b = m[8][j];
				var behavior_ctor = b[1];
				var behavior_plugin = null;
				for (k = 0, lenk = this.behaviors.length; k < lenk; k++)
				{
					if (this.behaviors[k] instanceof behavior_ctor)
					{
						behavior_plugin = this.behaviors[k];
						break;
					}
				}
				if (!behavior_plugin)
				{
					behavior_plugin = new behavior_ctor(this);
					behavior_plugin.my_instances = new cr.ObjectSet(); 	// instances of this behavior
					if (behavior_plugin.onCreate)
						behavior_plugin.onCreate();
					cr.seal(behavior_plugin);
					this.behaviors.push(behavior_plugin);
				}
				var behavior_type = new behavior_plugin.Type(behavior_plugin, type_inst);
				behavior_type.name = b[0];
				behavior_type.onCreate();
				cr.seal(behavior_type);
				type_inst.behaviors.push(behavior_type);
			}
			type_inst.global = m[9];
			type_inst.isOnLoaderLayout = m[10];
			type_inst.effect_types = [];
			for (j = 0, lenj = m[11].length; j < lenj; j++)
			{
				type_inst.effect_types.push({
					id: m[11][j][0],
					name: m[11][j][1],
					shaderindex: -1,
					active: true,
					index: j
				});
			}
			if (!this.uses_loader_layout || type_inst.is_family || type_inst.isOnLoaderLayout || !plugin.is_world)
			{
				type_inst.onCreate();
				cr.seal(type_inst);
			}
			if (type_inst.name)
				this.types[type_inst.name] = type_inst;
			this.types_by_index.push(type_inst);
			if (plugin.singleglobal)
			{
				var instance = new plugin.Instance(type_inst);
				instance.uid = this.next_uid;
				this.next_uid++;
				instance.iid = 0;
				instance.get_iid = cr.inst_get_iid;
				instance.toString = cr.inst_toString;
				instance.properties = m[12];
				instance.onCreate();
				cr.seal(instance);
				type_inst.instances.push(instance);
			}
		}
		for (i = 0, len = pm[4].length; i < len; i++)
		{
			var familydata = pm[4][i];
			var familytype = this.types_by_index[familydata[0]];
			var familymember;
			for (j = 1, lenj = familydata.length; j < lenj; j++)
			{
				familymember = this.types_by_index[familydata[j]];
				familymember.families.push(familytype);
				familytype.members.push(familymember);
			}
		}
		for (i = 0, len = pm[20].length; i < len; i++)
		{
			var containerdata = pm[20][i];
			var containertypes = [];
			for (j = 0, lenj = containerdata.length; j < lenj; j++)
				containertypes.push(this.types_by_index[containerdata[j]]);
			for (j = 0, lenj = containertypes.length; j < lenj; j++)
			{
				containertypes[j].is_contained = true;
				containertypes[j].container = containertypes;
			}
		}
		if (this.family_count > 0)
		{
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				if (t.is_family || !t.families.length)
					continue;
				t.family_var_map = new Array(this.family_count);
				t.family_beh_map = new Array(this.family_count);
				t.family_fx_map = new Array(this.family_count);
				var all_fx = [];
				var varsum = 0;
				var behsum = 0;
				var fxsum = 0;
				for (j = 0, lenj = t.families.length; j < lenj; j++)
				{
					f = t.families[j];
					t.family_var_map[f.family_index] = varsum;
					varsum += f.vars_count;
					t.family_beh_map[f.family_index] = behsum;
					behsum += f.behs_count;
					t.family_fx_map[f.family_index] = fxsum;
					fxsum += f.fx_count;
					for (k = 0, lenk = f.effect_types.length; k < lenk; k++)
						all_fx.push(cr.shallowCopy({}, f.effect_types[k]));
				}
				t.effect_types = all_fx.concat(t.effect_types);
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
					t.effect_types[j].index = j;
			}
		}
		for (i = 0, len = pm[5].length; i < len; i++)
		{
			m = pm[5][i];
			var layout = new cr.layout(this, m);
			cr.seal(layout);
			this.layouts[layout.name] = layout;
			this.layouts_by_index.push(layout);
		}
		for (i = 0, len = pm[6].length; i < len; i++)
		{
			m = pm[6][i];
			var sheet = new cr.eventsheet(this, m);
			cr.seal(sheet);
			this.eventsheets[sheet.name] = sheet;
			this.eventsheets_by_index.push(sheet);
		}
		for (i = 0, len = this.eventsheets_by_index.length; i < len; i++)
			this.eventsheets_by_index[i].postInit();
		for (i = 0, len = this.triggers_to_postinit.length; i < len; i++)
			this.triggers_to_postinit[i].postInit();
		this.triggers_to_postinit.length = 0;
		this.files_subfolder = pm[7];
		this.pixel_rounding = pm[8];
		this.original_width = pm[9];
		this.original_height = pm[10];
		this.aspect_scale = 1.0;
		this.enableWebGL = pm[12];
		this.linearSampling = pm[13];
		this.clearBackground = pm[14];
		this.versionstr = pm[15];
		var iOSretina = pm[16];
		if (iOSretina === 2)
			iOSretina = (this.isiPhone ? 1 : 0);
		this.useiOSRetina = (iOSretina !== 0);
		this.hideAddressBar = pm[19];
		this.start_time = Date.now();
	};
	Runtime.prototype.findWaitingTexture = function (src_)
	{
		var i, len;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++)
		{
			if (this.wait_for_textures[i].cr_src === src_)
				return this.wait_for_textures[i];
		}
		return null;
	};
	Runtime.prototype.areAllTexturesLoaded = function ()
	{
		var totalsize = 0;
		var completedsize = 0;
		var ret = true;
		var i, len;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++)
		{
			var filesize = this.wait_for_textures[i].cr_filesize;
			if (!filesize || filesize <= 0)
				filesize = 50000;
			totalsize += filesize;
			if (this.wait_for_textures[i].complete || this.wait_for_textures[i]["loaded"])
				completedsize += filesize;
			else
				ret = false;    // not all textures loaded
		}
		if (totalsize == 0)
			this.progress = 0;
		else
			this.progress = (completedsize / totalsize);
		return ret;
	};
	Runtime.prototype.go = function ()
	{
		if (!this.ctx && !this.glwrap)
			return;
		var ctx = this.ctx || this.overlay_ctx;
		if (this.overlay_canvas)
			this.positionOverlayCanvas();
		this.progress = 0;
		this.last_progress = -1;
		if (this.areAllTexturesLoaded())
			this.go_textures_done();
		else
		{
			var ms_elapsed = Date.now() - this.start_time;
			if (this.loaderstyle !== 3 && ms_elapsed >= 500 && this.last_progress != this.progress)
			{
				ctx.clearRect(0, 0, this.width, this.height);
				var mx = this.width / 2;
				var my = this.height / 2;
				var haslogo = (this.loaderstyle === 0 && this.loaderlogo.complete);
				var hlw = 40;
				var hlh = 0;
				var logowidth = 80;
				if (haslogo)
				{
					logowidth = this.loaderlogo.width;
					hlw = logowidth / 2;
					hlh = this.loaderlogo.height / 2;
					ctx.drawImage(this.loaderlogo, cr.floor(mx - hlw), cr.floor(my - hlh));
				}
				if (this.loaderstyle <= 1)
				{
					my += hlh + (haslogo ? 12 : 0);
					mx -= hlw;
					mx = cr.floor(mx) + 0.5;
					my = cr.floor(my) + 0.5;
					ctx.fillStyle = "DodgerBlue";
					ctx.fillRect(mx, my, Math.floor(logowidth * this.progress), 6);
					ctx.strokeStyle = "black";
					ctx.strokeRect(mx, my, logowidth, 6);
					ctx.strokeStyle = "white";
					ctx.strokeRect(mx - 1, my - 1, logowidth + 2, 8);
				}
				else if (this.loaderstyle === 2)
				{
					ctx.font = "12pt Arial";
					ctx.fillStyle = "#999";
					ctx.textBaseLine = "middle";
					var percent_text = Math.round(this.progress * 100) + "%";
					var text_dim = ctx.measureText ? ctx.measureText(percent_text) : null;
					var text_width = text_dim ? text_dim.width : 0;
					ctx.fillText(percent_text, mx - (text_width / 2), my);
				}
				this.last_progress = this.progress;
			}
			setTimeout((function (self) { return function () { self.go(); }; })(this), 100);
		}
	};
	Runtime.prototype.go_textures_done = function ()
	{
		if (this.overlay_canvas)
		{
			this.canvas.parentNode.removeChild(this.overlay_canvas);
			this.overlay_ctx = null;
			this.overlay_canvas = null;
		}
		this.start_time = Date.now();
		this.last_fps_time = cr.performance_now();       // for counting framerate
		var i, len, t;
		if (this.uses_loader_layout)
		{
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				if (!t.is_family && !t.isOnLoaderLayout && t.plugin.is_world)
				{
					t.onCreate();
					cr.seal(t);
				}
			}
		}
		else
			this.isloading = false;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++)
		{
			this.layouts_by_index[i].createGlobalNonWorlds();
		}
		if (this.first_layout)
			this.layouts[this.first_layout].startRunning();
		else
			this.layouts_by_index[0].startRunning();
;
		if (!this.uses_loader_layout)
		{
			this.loadingprogress = 1;
			this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
		}
		this.tick();
		if (this.isDirectCanvas)
			AppMobi["webview"]["execute"]("onGameReady();");
	};
	var raf = window["requestAnimationFrame"] ||
	  window["mozRequestAnimationFrame"]    ||
	  window["webkitRequestAnimationFrame"] ||
	  window["msRequestAnimationFrame"]     ||
	  window["oRequestAnimationFrame"];
	Runtime.prototype.tick = function ()
	{
		if (this.isArcade)
		{
			var curwidth = jQuery(window).width();
			var curheight = jQuery(window).height();
			if (this.lastwidth !== curwidth || this.lastheight !== curheight)
			{
				this.lastwidth = curwidth;
				this.lastheight = curheight;
				this["setSize"](curwidth, curheight);
			}
		}
;
		var logic_start = cr.performance_now();
		if (this.isloading)
		{
			var done = this.areAllTexturesLoaded();		// updates this.progress
			this.loadingprogress = this.progress;
			if (done)
			{
				this.isloading = false;
				this.progress = 1;
				this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
			}
		}
		this.logic();
		if ((this.redraw || (this.isAwesomium && this.tickcount < 60)) && !this.is_WebGL_context_lost)
		{
			this.redraw = false;
			if (this.glwrap)
				this.drawGL();
			else
				this.draw();
			if (this.snapshotCanvas)
			{
				if (this.canvas && this.canvas.toDataURL)
				{
					this.snapshotData = this.canvas.toDataURL(this.snapshotCanvas[0], this.snapshotCanvas[1]);
					this.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot, null);
				}
				this.snapshotCanvas = null;
			}
		}
		this.tickcount++;
		this.execcount++;
		this.framecount++;
		this.logictime += cr.performance_now() - logic_start;
		if (this.isSuspended)
			return;
		if (raf)
			this.raf_id = raf(this.tickFunc, this.canvas);
		else
		{
			this.timeout_id = setTimeout(this.tickFunc, this.isMobile ? 1 : 16);
		}
	};
	Runtime.prototype.logic = function ()
	{
		var i, leni, j, lenj, k, lenk, type, binst, type;
		var cur_time = cr.performance_now();
		if (cur_time - this.last_fps_time >= 1000)  // every 1 second
		{
			this.last_fps_time += 1000;
			this.fps = this.framecount;
			this.framecount = 0;
			this.cpuutilisation = this.logictime;
			this.logictime = 0;
		}
		if (this.measuring_dt)
		{
			if (this.last_tick_time !== 0)
			{
				var ms_diff = cur_time - this.last_tick_time;
				if (ms_diff === 0)
				{
					this.zeroDtCount++;
					if (this.zeroDtCout >= 10)
						this.measuring_dt = false;
					this.dt1 = 1.0 / 60.0;            // 60fps assumed (0.01666...)
				}
				else
				{
					this.dt1 = ms_diff / 1000.0; // dt measured in seconds
					if (this.dt1 > 0.5)
						this.dt1 = 0;
					else if (this.dt1 > 0.1)
						this.dt1 = 0.1;
				}
			}
			this.last_tick_time = cur_time;
		}
        this.dt = this.dt1 * this.timescale;
        this.kahanTime.add(this.dt);
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
		if (this.fullscreen_mode >= 2 /* scale */ || (isfullscreen && this.fullscreen_scaling > 0))
		{
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			if (cur_aspect > orig_aspect)
				this.aspect_scale = this.height / this.original_height;
			else
			{
				this.aspect_scale = this.width / this.original_width;
			}
			if (this.running_layout)
			{
				this.running_layout.scrollToX(this.running_layout.scrollX);
				this.running_layout.scrollToY(this.running_layout.scrollY);
			}
		}
		else
			this.aspect_scale = 1;
		this.ClearDeathRow();
		this.isInOnDestroy++;
		this.system.runWaits();		// prevent instance list changing
		this.isInOnDestroy--;
		this.ClearDeathRow();		// allow instance list changing
		this.isInOnDestroy++;
		for (i = 0, leni = this.types_by_index.length; i < leni; i++)
		{
			type = this.types_by_index[i];
			if (!type.behaviors.length)
				continue;	// type doesn't have any behaviors
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				var inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
				{
					inst.behavior_insts[k].tick();
				}
			}
		}
        var tickarr = this.objects_to_tick.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick();
		this.isInOnDestroy--;		// end preventing instance lists from being changed
		i = 0;
		while (this.changelayout && i++ < 10)
		{
;
			this.running_layout.stopRunning();
			for (j = 0, lenj = this.types_by_index.length; j < lenj; j++)
			{
				type = this.types_by_index[j];
				if (type.unloadTextures && this.changelayout.initial_types.indexOf(type) === -1)
					type.unloadTextures();
			}
			this.changelayout.startRunning();
			for (i = 0, leni = this.types_by_index.length; i < leni; i++)
			{
				type = this.types_by_index[i];
				if (!type.global && !type.plugin.singleglobal)
					continue;
				for (j = 0, lenj = type.instances.length; j < lenj; j++)
				{
					var inst = type.instances[j];
					if (inst.onLayoutChange)
						inst.onLayoutChange();
				}
			}
			this.redraw = true;
			this.layout_first_tick = true;
			this.ClearDeathRow();
		}
        for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
            this.eventsheets_by_index[i].hasRun = false;
		if (this.running_layout.event_sheet)
			this.running_layout.event_sheet.run();
		this.registered_collisions.length = 0;
		this.layout_first_tick = false;
		this.isInOnDestroy++;		// prevent instance lists from being changed
		for (i = 0, leni = this.types_by_index.length; i < leni; i++)
		{
			type = this.types_by_index[i];
			if (!type.behaviors.length)
				continue;	// type doesn't have any behaviors
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				var inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
				{
					binst = inst.behavior_insts[k];
					if (binst.tick2)
						binst.tick2();
				}
			}
		}
        tickarr = this.objects_to_tick2.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick2();
		this.isInOnDestroy--;		// end preventing instance lists from being changed
	};
    Runtime.prototype.tickMe = function (inst)
    {
        this.objects_to_tick.add(inst);
    };
	Runtime.prototype.untickMe = function (inst)
	{
		this.objects_to_tick.remove(inst);
	};
	Runtime.prototype.tick2Me = function (inst)
    {
        this.objects_to_tick2.add(inst);
    };
	Runtime.prototype.untick2Me = function (inst)
	{
		this.objects_to_tick2.remove(inst);
	};
    Runtime.prototype.getDt = function (inst)
    {
        if (!inst || inst.my_timescale === -1.0)
            return this.dt;
        return this.dt1 * inst.my_timescale;
    };
	Runtime.prototype.draw = function ()
	{
		this.running_layout.draw(this.ctx);
		if (this.isDirectCanvas)
			this.ctx["present"]();
	};
	Runtime.prototype.drawGL = function ()
	{
		this.running_layout.drawGL(this.glwrap);
	};
	Runtime.prototype.addDestroyCallback = function (f)
	{
		if (f)
			this.destroycallbacks.push(f);
	};
	Runtime.prototype.removeDestroyCallback = function (f)
	{
		cr.arrayFindRemove(this.destroycallbacks, f);
	};
	Runtime.prototype.DestroyInstance = function (inst)
	{
		var i, len;
		if (!this.deathRow.contains(inst))
		{
			this.deathRow.add(inst);
			if (inst.is_contained)
			{
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					this.DestroyInstance(inst.siblings[i]);
				}
			}
			if (this.isInClearDeathRow)
				this.deathRow.values_cache.push(inst);
			this.isInOnDestroy++;		// support recursion
			this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnDestroyed, inst);
			this.isInOnDestroy--;
		}
	};
	Runtime.prototype.ClearDeathRow = function ()
	{
		var inst, index, type, instances, binst;
		var i, j, k, leni, lenj, lenk;
		var w, f;
		this.isInClearDeathRow = true;
		for (i = 0, leni = this.createRow.length; i < leni; i++)
		{
			inst = this.createRow[i];
			type = inst.type;
			type.instances.push(inst);
			type.stale_iids = true;
			for (j = 0, lenj = type.families.length; j < lenj; j++)
			{
				type.families[j].instances.push(inst);
				type.families[j].stale_iids = true;
			}
		}
		this.createRow.length = 0;
		var arr = this.deathRow.valuesRef();	// get array of items from set
		for (i = 0; i < arr.length; i++)		// check array length every time in case it changes
		{
			inst = arr[i];
			type = inst.type;
			instances = type.instances;
			for (j = 0, lenj = this.destroycallbacks.length; j < lenj; j++)
				this.destroycallbacks[j](inst);
			cr.arrayFindRemove(instances, inst);
			if (inst.layer)
			{
				cr.arrayRemove(inst.layer.instances, inst.get_zindex());
				inst.layer.zindices_stale = true;
			}
			for (j = 0, lenj = type.families.length; j < lenj; j++)
			{
				cr.arrayFindRemove(type.families[j].instances, inst);
				type.families[j].stale_iids = true;
			}
			if (inst.behavior_insts)
			{
				for (j = 0, lenj = inst.behavior_insts.length; j < lenj; j++)
				{
					binst = inst.behavior_insts[j];
					if (binst.onDestroy)
						binst.onDestroy();
					binst.behavior.my_instances.remove(inst);
				}
			}
            this.objects_to_tick.remove(inst);
			this.objects_to_tick2.remove(inst);
			for (j = 0, lenj = this.system.waits.length; j < lenj; j++)
			{
				w = this.system.waits[j];
				if (w.sols.hasOwnProperty(type.index))
					cr.arrayFindRemove(w.sols[type.index], inst);
				if (!type.is_family)
				{
					for (k = 0, lenk = type.families.length; k < lenk; k++)
					{
						f = type.families[k];
						if (w.sols.hasOwnProperty(f.index))
							cr.arrayFindRemove(w.sols[f.index], inst);
					}
				}
			}
			if (inst.onDestroy)
				inst.onDestroy();
			this.objectcount--;
			if (type.deadCache.length < 32)
				type.deadCache.push(inst);
			type.stale_iids = true;
		}
		if (!this.deathRow.isEmpty())
			this.redraw = true;
		this.deathRow.clear();
		this.isInClearDeathRow = false;
	};
	Runtime.prototype.createInstance = function (type, layer, sx, sy)
	{
		if (type.is_family)
		{
			var i = cr.floor(Math.random() * type.members.length);
			return this.createInstance(type.members[i], layer, sx, sy);
		}
		if (!type.default_instance)
		{
			return null;
		}
		return this.createInstanceFromInit(type.default_instance, layer, false, sx, sy);
	};
	var all_behaviors = [];
	Runtime.prototype.createInstanceFromInit = function (initial_inst, layer, is_startup_instance, sx, sy, skip_siblings)
	{
		var i, len, j, lenj, p, effect_fallback, x, y;
		if (!initial_inst)
			return null;
		var type = this.types_by_index[initial_inst[1]];
;
;
		var is_world = type.plugin.is_world;
;
		if (this.isloading && is_world && !type.isOnLoaderLayout)
			return null;
		if (is_world && !this.glwrap && initial_inst[0][11] === 11)
			return null;
		if (!is_world)
			layer = null;
		var inst;
		var recycled_inst = false;
		if (type.deadCache.length)
		{
			inst = type.deadCache.pop();
			recycled_inst = true;
			type.plugin.Instance.call(inst, type);
		}
		else
			inst = new type.plugin.Instance(type);
		inst.uid = this.next_uid;
		this.next_uid++;
		inst.iid = 0;
		inst.get_iid = cr.inst_get_iid;
		type.stale_iids = true;
		var initial_vars = initial_inst[2];
		if (recycled_inst)
		{
			for (i = 0, len = initial_vars.length; i < len; i++)
				inst.instance_vars[i] = initial_vars[i];
			cr.wipe(inst.extra);
		}
		else
		{
			inst.instance_vars = initial_vars.slice(0);
			inst.extra = {};
		}
		if (is_world)
		{
			var wm = initial_inst[0];
;
			inst.x = cr.is_undefined(sx) ? wm[0] : sx;
			inst.y = cr.is_undefined(sy) ? wm[1] : sy;
			inst.z = wm[2];
			inst.width = wm[3];
			inst.height = wm[4];
			inst.depth = wm[5];
			inst.angle = wm[6];
			inst.opacity = wm[7];
			inst.hotspotX = wm[8];
			inst.hotspotY = wm[9];
			inst.blend_mode = wm[10];
			effect_fallback = wm[11];
			if (!this.glwrap && type.effect_types.length)	// no WebGL renderer and shaders used
				inst.blend_mode = effect_fallback;			// use fallback blend mode - destroy mode was handled above
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl)
				cr.setGLBlend(inst, inst.blend_mode, this.gl);
			if (recycled_inst)
			{
				for (i = 0, len = wm[12].length; i < len; i++)
				{
					for (j = 0, lenj = wm[12][i].length; j < lenj; j++)
						inst.effect_params[i][j] = wm[12][i][j];
				}
				inst.bbox.set(0, 0, 0, 0);
				inst.bquad.set_from_rect(inst.bbox);
				inst.bbox_changed_callbacks.length = 0;
			}
			else
			{
				inst.effect_params = wm[12].slice(0);
				for (i = 0, len = inst.effect_params.length; i < len; i++)
					inst.effect_params[i] = wm[12][i].slice(0);
				inst.active_effect_types = [];
				inst.active_effect_flags = [];
				inst.active_effect_flags.length = type.effect_types.length;
				inst.bbox = new cr.rect(0, 0, 0, 0);
				inst.bquad = new cr.quad();
				inst.bbox_changed_callbacks = [];
				inst.set_bbox_changed = cr.set_bbox_changed;
				inst.add_bbox_changed_callback = cr.add_bbox_changed_callback;
				inst.contains_pt = cr.inst_contains_pt;
				inst.update_bbox = cr.update_bbox;
				inst.get_zindex = cr.inst_get_zindex;
			}
			for (i = 0, len = type.effect_types.length; i < len; i++)
				inst.active_effect_flags[i] = true;
			inst.updateActiveEffects = cr.inst_updateActiveEffects;
			inst.updateActiveEffects();
			inst.uses_shaders = !!inst.active_effect_types.length;
			inst.bbox_changed = true;
			inst.visible = true;
            inst.my_timescale = -1.0;
			inst.layer = layer;
			inst.zindex = layer.instances.length;	// will be placed at top of current layer
			if (typeof inst.collision_poly === "undefined")
				inst.collision_poly = null;
			inst.collisionsEnabled = true;
			this.redraw = true;
		}
		inst.toString = cr.inst_toString;
		var initial_props, binst;
		all_behaviors.length = 0;
		for (i = 0, len = type.families.length; i < len; i++)
		{
			all_behaviors.push.apply(all_behaviors, type.families[i].behaviors);
		}
		all_behaviors.push.apply(all_behaviors, type.behaviors);
		if (recycled_inst)
		{
			for (i = 0, len = all_behaviors.length; i < len; i++)
			{
				var btype = all_behaviors[i];
				binst = inst.behavior_insts[i];
				btype.behavior.Instance.call(binst, btype, inst);
				initial_props = initial_inst[3][i];
				for (j = 0, lenj = initial_props.length; j < lenj; j++)
					binst.properties[j] = initial_props[j];
				binst.onCreate();
				btype.behavior.my_instances.add(inst);
			}
		}
		else
		{
			inst.behavior_insts = [];
			for (i = 0, len = all_behaviors.length; i < len; i++)
			{
				var btype = all_behaviors[i];
				var binst = new btype.behavior.Instance(btype, inst);
				binst.properties = initial_inst[3][i].slice(0);
				binst.onCreate();
				cr.seal(binst);
				inst.behavior_insts.push(binst);
				btype.behavior.my_instances.add(inst);
			}
		}
		initial_props = initial_inst[4];
		if (recycled_inst)
		{
			for (i = 0, len = initial_props.length; i < len; i++)
				inst.properties[i] = initial_props[i];
		}
		else
			inst.properties = initial_props.slice(0);
		this.createRow.push(inst);
		if (layer)
		{
;
			layer.instances.push(inst);
		}
		this.objectcount++;
		if (type.is_contained)
		{
			inst.is_contained = true;
			inst.siblings = [];			// note: should not include self
			if (!is_startup_instance && !skip_siblings)	// layout links initial instances
			{
				for (i = 0, len = type.container.length; i < len; i++)
				{
					if (type.container[i] === type)
						continue;
					if (!type.container[i].default_instance)
					{
						return null;
					}
					inst.siblings.push(this.createInstanceFromInit(type.container[i].default_instance, layer, false, is_world ? inst.x : sx, is_world ? inst.y : sy, true));
				}
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					inst.siblings[i].siblings.push(inst);
					for (j = 0; j < len; j++)
					{
						if (i !== j)
							inst.siblings[i].siblings.push(inst.siblings[j]);
					}
				}
			}
		}
		else
		{
			inst.is_contained = false;
			inst.siblings = null;
		}
		inst.onCreate();
		if (!recycled_inst)
			cr.seal(inst);
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i].postCreate)
				inst.behavior_insts[i].postCreate();
		}
		return inst;
	};
	Runtime.prototype.getLayerByName = function (layer_name)
	{
		var i, len;
		for (i = 0, len = this.running_layout.layers.length; i < len; i++)
		{
			var layer = this.running_layout.layers[i];
			if (layer.name.toLowerCase() === layer_name.toLowerCase())
				return layer;
		}
		return null;
	};
	Runtime.prototype.getLayerByNumber = function (index)
	{
		index = cr.floor(index);
		if (index < 0)
			index = 0;
		if (index >= this.running_layout.layers.length)
			index = this.running_layout.layers.length - 1;
		return this.running_layout.layers[index];
	};
	Runtime.prototype.getLayer = function (l)
	{
		if (cr.is_number(l))
			return this.getLayerByNumber(l);
		else
			return this.getLayerByName(l.toString());
	};
	Runtime.prototype.clearSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].getCurrentSol().select_all = true;
		}
	};
	Runtime.prototype.pushCleanSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].pushCleanSol();
		}
	};
	Runtime.prototype.pushCopySol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].pushCopySol();
		}
	};
	Runtime.prototype.popSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].popSol();
		}
	};
	Runtime.prototype.testAndSelectCanvasPointOverlap = function (type, ptx, pty, inverted)
	{
		var sol = type.getCurrentSol();
		var i, j, inst, len;
		var lx, ly;
		if (sol.select_all)
		{
			if (!inverted)
			{
				sol.select_all = false;
				sol.instances.length = 0;   // clear contents
			}
			for (i = 0, len = type.instances.length; i < len; i++)
			{
				inst = type.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly))
				{
					if (inverted)
						return false;
					else
						sol.instances.push(inst);
				}
			}
		}
		else
		{
			j = 0;
			for (i = 0, len = sol.instances.length; i < len; i++)
			{
				inst = sol.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly))
				{
					if (inverted)
						return false;
					else
					{
						sol.instances[j] = sol.instances[i];
						j++;
					}
				}
			}
			if (!inverted)
				sol.instances.length = j;
		}
		type.applySolToContainer();
		if (inverted)
			return true;		// did not find anything overlapping
		else
			return sol.hasObjects();
	};
	Runtime.prototype.testOverlap = function (a, b)
	{
		if (!a || !b || a === b || !a.collisionsEnabled || !b.collisionsEnabled)
			return false;
		a.update_bbox();
		b.update_bbox();
		var layera = a.layer;
		var layerb = b.layer;
		var different_layers = (layera !== layerb && (layera.parallaxX !== layerb.parallaxX || layerb.parallaxY !== layerb.parallaxY || layera.scale !== layerb.scale || layera.angle !== layerb.angle || layera.zoomRate !== layerb.zoomRate));
		var i, len, x, y, haspolya, haspolyb, polya, polyb;
		if (!different_layers)	// same layers: easy check
		{
			if (!a.bbox.intersects_rect(b.bbox))
				return false;
			if (!a.bquad.intersects_quad(b.bquad))
				return false;
			haspolya = (a.collision_poly && !a.collision_poly.is_empty());
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (!haspolya && !haspolyb)
				return true;
			if (haspolya)
			{
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				polya = a.collision_poly;
			}
			else
			{
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
				polya = this.temp_poly;
			}
			if (haspolyb)
			{
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				polyb = b.collision_poly;
			}
			else
			{
				this.temp_poly.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
				polyb = this.temp_poly;
			}
			return polya.intersects_poly(polyb, b.x - a.x, b.y - a.y);
		}
		else	// different layers: need to do full translated check
		{
			haspolya = (a.collision_poly && !a.collision_poly.is_empty());
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (haspolya)
			{
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				this.temp_poly.set_from_poly(a.collision_poly);
			}
			else
			{
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
			}
			polya = this.temp_poly;
			if (haspolyb)
			{
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				this.temp_poly2.set_from_poly(b.collision_poly);
			}
			else
			{
				this.temp_poly2.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
			}
			polyb = this.temp_poly2;
			for (i = 0, len = polya.pts_count; i < len; i++)
			{
				x = polya.pts_cache[i*2];
				y = polya.pts_cache[i*2+1];
				polya.pts_cache[i*2] = layera.layerToCanvas(x + a.x, y + a.y, true);
				polya.pts_cache[i*2+1] = layera.layerToCanvas(x + a.x, y + a.y, false);
			}
			for (i = 0, len = polyb.pts_count; i < len; i++)
			{
				x = polyb.pts_cache[i*2];
				y = polyb.pts_cache[i*2+1];
				polyb.pts_cache[i*2] = layerb.layerToCanvas(x + b.x, y + b.y, true);
				polyb.pts_cache[i*2+1] = layerb.layerToCanvas(x + b.x, y + b.y, false);
			}
			return polya.intersects_poly(polyb, 0, 0);
		}
	};
	Runtime.prototype.testOverlapSolid = function (inst)
	{
		var solid = null;
		var i, len, s;
		if (!cr.behaviors.solid)
			return null;
		for (i = 0, len = this.behaviors.length; i < len; i++)
		{
			if (this.behaviors[i] instanceof cr.behaviors.solid)
			{
				solid = this.behaviors[i];
				break;
			}
		}
		if (!solid)
			return null;
		var solids = solid.my_instances.valuesRef();
		for (i = 0, len = solids.length; i < len; ++i)
		{
			s = solids[i];
			if (!s.extra.solidEnabled)
				continue;
			if (this.testOverlap(inst, s))
				return s;
		}
		return null;
	};
	var jumpthru_array_ret = [];
	Runtime.prototype.testOverlapJumpThru = function (inst, all)
	{
		var jumpthru = null;
		var i, len, s;
		if (!cr.behaviors.jumpthru)
			return null;
		for (i = 0, len = this.behaviors.length; i < len; i++)
		{
			if (this.behaviors[i] instanceof cr.behaviors.jumpthru)
			{
				jumpthru = this.behaviors[i];
				break;
			}
		}
		if (!jumpthru)
			return null;
		var ret = null;
		if (all)
		{
			ret = jumpthru_array_ret;
			ret.length = 0;
		}
		var jumpthrus = jumpthru.my_instances.valuesRef();
		for (i = 0, len = jumpthrus.length; i < len; ++i)
		{
			s = jumpthrus[i];
			if (!s.extra.jumpthruEnabled)
				continue;
			if (this.testOverlap(inst, s))
			{
				if (all)
					ret.push(s);
				else
					return s;
			}
		}
		return ret;
	};
	Runtime.prototype.pushOutSolid = function (inst, xdir, ydir, dist, include_jumpthrus, specific_jumpthru)
	{
		var push_dist = dist || 50;
		var oldx = inst.x
		var oldy = inst.y;
		var i;
		var last_overlapped = null, secondlast_overlapped = null;
		for (i = 0; i < push_dist; i++)
		{
			inst.x = (oldx + (xdir * i));
			inst.y = (oldy + (ydir * i));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped))
			{
				last_overlapped = this.testOverlapSolid(inst);
				if (last_overlapped)
					secondlast_overlapped = last_overlapped;
				if (!last_overlapped)
				{
					if (include_jumpthrus)
					{
						if (specific_jumpthru)
							last_overlapped = (this.testOverlap(inst, specific_jumpthru) ? specific_jumpthru : null);
						else
							last_overlapped = this.testOverlapJumpThru(inst);
						if (last_overlapped)
							secondlast_overlapped = last_overlapped;
					}
					if (!last_overlapped)
					{
						if (secondlast_overlapped)
							this.pushInFractional(inst, xdir, ydir, secondlast_overlapped, 16);
						return true;
					}
				}
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.pushInFractional = function (inst, xdir, ydir, obj, limit)
	{
		var divisor = 2;
		var frac;
		var forward = false;
		var overlapping = false;
		var bestx = inst.x;
		var besty = inst.y;
		while (divisor <= limit)
		{
			frac = 1 / divisor;
			divisor *= 2;
			inst.x += xdir * frac * (forward ? 1 : -1);
			inst.y += ydir * frac * (forward ? 1 : -1);
			inst.set_bbox_changed();
			if (this.testOverlap(inst, obj))
			{
				forward = true;
				overlapping = true;
			}
			else
			{
				forward = false;
				overlapping = false;
				bestx = inst.x;
				besty = inst.y;
			}
		}
		if (overlapping)
		{
			inst.x = bestx;
			inst.y = besty;
			inst.set_bbox_changed();
		}
	};
	Runtime.prototype.pushOutSolidNearest = function (inst, max_dist_)
	{
		var max_dist = (cr.is_undefined(max_dist_) ? 100 : max_dist_);
		var dist = 0;
		var oldx = inst.x
		var oldy = inst.y;
		var dir = 0;
		var dx = 0, dy = 0;
		var last_overlapped = null;
		while (dist <= max_dist)
		{
			switch (dir) {
			case 0:		dx = 0; dy = -1; dist++; break;
			case 1:		dx = 1; dy = -1; break;
			case 2:		dx = 1; dy = 0; break;
			case 3:		dx = 1; dy = 1; break;
			case 4:		dx = 0; dy = 1; break;
			case 5:		dx = -1; dy = 1; break;
			case 6:		dx = -1; dy = 0; break;
			case 7:		dx = -1; dy = -1; break;
			}
			dir = (dir + 1) % 8;
			inst.x = cr.floor(oldx + (dx * dist));
			inst.y = cr.floor(oldy + (dy * dist));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped))
			{
				last_overlapped = this.testOverlapSolid(inst);
				if (!last_overlapped)
					return true;
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.registerCollision = function (a, b)
	{
		if (!a.collisionsEnabled || !b.collisionsEnabled)
			return;
		this.registered_collisions.push([a, b]);
	};
	Runtime.prototype.checkRegisteredCollision = function (a, b)
	{
		var i, len, x;
		for (i = 0, len = this.registered_collisions.length; i < len; i++)
		{
			x = this.registered_collisions[i];
			if ((x[0] == a && x[1] == b) || (x[0] == b && x[1] == a))
				return true;
		}
		return false;
	};
	Runtime.prototype.calculateSolidBounceAngle = function(inst, startx, starty, obj)
	{
		var objx = inst.x;
		var objy = inst.y;
		var radius = cr.max(10, cr.distanceTo(startx, starty, objx, objy));
		var startangle = cr.angleTo(startx, starty, objx, objy);
		var firstsolid = obj || this.testOverlapSolid(inst);
		if (!firstsolid)
			return cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		var i, curangle, anticlockwise_free_angle, clockwise_free_angle;
		var increment = cr.to_radians(5);	// 5 degree increments
		for (i = 1; i < 36; i++)
		{
			curangle = startangle - i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid))
			{
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid)
				{
					anticlockwise_free_angle = curangle;
					break;
				}
			}
		}
		if (i === 36)
			anticlockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		for (i = 1; i < 36; i++)
		{
			curangle = startangle + i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid))
			{
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid)
				{
					clockwise_free_angle = curangle;
					break;
				}
			}
		}
		if (i === 36)
			clockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		inst.x = objx;
		inst.y = objy;
		inst.set_bbox_changed();
		if (clockwise_free_angle === anticlockwise_free_angle)
			return clockwise_free_angle;
		var half_diff = cr.angleDiff(clockwise_free_angle, anticlockwise_free_angle) / 2;
		var normal;
		if (cr.angleClockwise(clockwise_free_angle, anticlockwise_free_angle))
		{
			normal = cr.clamp_angle(anticlockwise_free_angle + half_diff + cr.PI);
		}
		else
		{
			normal = cr.clamp_angle(clockwise_free_angle + half_diff);
		}
;
		var vx = Math.cos(startangle);
		var vy = Math.sin(startangle);
		var nx = Math.cos(normal);
		var ny = Math.sin(normal);
		var v_dot_n = vx * nx + vy * ny;
		var rx = vx - 2 * v_dot_n * nx;
		var ry = vy - 2 * v_dot_n * ny;
		return cr.angleTo(0, 0, rx, ry);
	};
	var triggerSheetStack = [];
	var triggerSheetIndex = -1;
	Runtime.prototype.trigger = function (method, inst, value /* for fast triggers */)
	{
;
		if (!this.running_layout)
			return false;
		var sheet = this.running_layout.event_sheet;
		if (!sheet)
			return false;     // no event sheet active; nothing to trigger
		triggerSheetIndex++;
		if (triggerSheetIndex === triggerSheetStack.length)
			triggerSheetStack.push(new cr.ObjectSet());
		else
			triggerSheetStack[triggerSheetIndex].clear();
        var ret = this.triggerOnSheet(method, inst, sheet, value);
		triggerSheetIndex--;
		return ret;
    };
    Runtime.prototype.triggerOnSheet = function (method, inst, sheet, value)
    {
		var alreadyTriggeredSheets = triggerSheetStack[triggerSheetIndex];
        if (alreadyTriggeredSheets.contains(sheet))
            return false;
        alreadyTriggeredSheets.add(sheet);
        var includes = sheet.includes.valuesRef();
        var ret = false;
		var i, leni, r;
        for (i = 0, leni = includes.length; i < leni; i++)
        {
            r = this.triggerOnSheet(method, inst, includes[i], value);
            ret = ret || r;
        }
		if (!inst)
		{
			r = this.triggerOnSheetForTypeName(method, inst, "system", sheet, value);
			ret = ret || r;
		}
		else
		{
			r = this.triggerOnSheetForTypeName(method, inst, inst.type.name, sheet, value);
			ret = ret || r;
			for (i = 0, leni = inst.type.families.length; i < leni; i++)
			{
				r = this.triggerOnSheetForTypeName(method, inst, inst.type.families[i].name, sheet, value);
				ret = ret || r;
			}
		}
		return ret;             // true if anything got triggered
	};
	Runtime.prototype.triggerOnSheetForTypeName = function (method, inst, type_name, sheet, value)
	{
		var i, leni;
		var ret = false, ret2 = false;
		var trig, index;
		var fasttrigger = (typeof value !== "undefined");
		var triggers = (fasttrigger ? sheet.fasttriggers : sheet.triggers);
		var obj_entry = triggers[type_name];
		if (!obj_entry)
			return ret;
		var triggers_list = null;
		for (i = 0, leni = obj_entry.length; i < leni; i++)
		{
			if (obj_entry[i].method == method)
			{
				triggers_list = obj_entry[i].evs;
				break;
			}
		}
		if (!triggers_list)
			return ret;
		var triggers_to_fire;
		if (fasttrigger)
		{
			triggers_to_fire = triggers_list[value];
		}
		else
		{
			triggers_to_fire = triggers_list;
		}
		if (!triggers_to_fire)
			return null;
		for (i = 0, leni = triggers_to_fire.length; i < leni; i++)
		{
			trig = triggers_to_fire[i][0];
			index = triggers_to_fire[i][1];
			ret2 = this.executeSingleTrigger(inst, type_name, trig, index);
			ret = ret || ret2;
		}
		return ret;
	};
	Runtime.prototype.executeSingleTrigger = function (inst, type_name, trig, index)
	{
		var i, leni;
		var ret = false;
		this.trigger_depth++;
		var current_event = this.getCurrentEventStack().current_event;
		if (current_event)
			this.pushCleanSol(current_event.solModifiersIncludingParents);
		var isrecursive = (this.trigger_depth > 1);		// calling trigger from inside another trigger
		this.pushCleanSol(trig.solModifiersIncludingParents);
		if (isrecursive)
			this.pushLocalVarStack();
		var event_stack = this.pushEventStack(trig);
		event_stack.current_event = trig;
		if (inst)
		{
			var sol = this.types[type_name].getCurrentSol();
			sol.select_all = false;
			sol.instances.length = 1;
			sol.instances[0] = inst;
			this.types[type_name].applySolToContainer();
		}
		var ok_to_run = true;
		if (trig.parent)
		{
			var temp_parents_arr = event_stack.temp_parents_arr;
			var cur_parent = trig.parent;
			while (cur_parent)
			{
				temp_parents_arr.push(cur_parent);
				cur_parent = cur_parent.parent;
			}
			temp_parents_arr.reverse();
			for (i = 0, leni = temp_parents_arr.length; i < leni; i++)
			{
				if (!temp_parents_arr[i].run_pretrigger())   // parent event failed
				{
					ok_to_run = false;
					break;
				}
			}
		}
		if (ok_to_run)
		{
			this.execcount++;
			if (trig.orblock)
				trig.run_orblocktrigger(index);
			else
				trig.run();
			ret = ret || event_stack.last_event_true;
		}
		this.popEventStack();
		if (isrecursive)
			this.popLocalVarStack();
		this.popSol(trig.solModifiersIncludingParents);
		if (current_event)
			this.popSol(current_event.solModifiersIncludingParents);
		if (this.isInOnDestroy === 0 && triggerSheetIndex === 0 && !this.isRunningEvents && (!this.deathRow.isEmpty() || this.createRow.length))
		{
			this.ClearDeathRow();
		}
		this.trigger_depth--;
		return ret;
	};
	Runtime.prototype.getCurrentCondition = function ()
	{
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.conditions[evinfo.cndindex];
	};
	Runtime.prototype.getCurrentAction = function ()
	{
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.actions[evinfo.actindex];
	};
	Runtime.prototype.pushLocalVarStack = function ()
	{
		this.localvar_stack_index++;
		if (this.localvar_stack_index >= this.localvar_stack.length)
			this.localvar_stack.push([]);
	};
	Runtime.prototype.popLocalVarStack = function ()
	{
;
		this.localvar_stack_index--;
	};
	Runtime.prototype.getCurrentLocalVarStack = function ()
	{
		return this.localvar_stack[this.localvar_stack_index];
	};
	Runtime.prototype.pushEventStack = function (cur_event)
	{
		this.event_stack_index++;
		if (this.event_stack_index >= this.event_stack.length)
			this.event_stack.push(new cr.eventStackFrame());
		var ret = this.getCurrentEventStack();
		ret.reset(cur_event);
		return ret;
	};
	Runtime.prototype.popEventStack = function ()
	{
;
		this.event_stack_index--;
	};
	Runtime.prototype.getCurrentEventStack = function ()
	{
		return this.event_stack[this.event_stack_index];
	};
	Runtime.prototype.pushLoopStack = function (name_)
	{
		this.loop_stack_index++;
		if (this.loop_stack_index >= this.loop_stack.length)
		{
			this.loop_stack.push(cr.seal({ name: name_, index: 0, stopped: false }));
		}
		var ret = this.getCurrentLoop();
		ret.name = name_;
		ret.index = 0;
		ret.stopped = false;
		return ret;
	};
	Runtime.prototype.popLoopStack = function ()
	{
;
		this.loop_stack_index--;
	};
	Runtime.prototype.getCurrentLoop = function ()
	{
		return this.loop_stack[this.loop_stack_index];
	};
	Runtime.prototype.getEventVariableByName = function (name, scope)
	{
		var i, leni, j, lenj, sheet, e;
		while (scope)
		{
			for (i = 0, leni = scope.subevents.length; i < leni; i++)
			{
				e = scope.subevents[i];
				if (e instanceof cr.eventvariable && name.toLowerCase() === e.name.toLowerCase())
					return e;
			}
			scope = scope.parent;
		}
		for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
		{
			sheet = this.eventsheets_by_index[i];
			for (j = 0, lenj = sheet.events.length; j < lenj; j++)
			{
				e = sheet.events[j];
				if (e instanceof cr.eventvariable && name.toLowerCase() === e.name.toLowerCase())
					return e;
			}
		}
		return null;
	};
	cr.runtime = Runtime;
	cr.createRuntime = function (canvasid)
	{
		return new Runtime(document.getElementById(canvasid));
	};
	cr.createDCRuntime = function (w, h)
	{
		return new Runtime({ "dc": true, "width": w, "height": h });
	};
	window["cr_createRuntime"] = cr.createRuntime;
	window["cr_createDCRuntime"] = cr.createDCRuntime;
	window["createCocoonJSRuntime"] = function ()
	{
		window["c2cocoonjs"] = true;
		var canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		var rt = new Runtime(canvas);
		window["c2runtime"] = rt;
		window.addEventListener("orientationchange", function () {
			window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
		});
		return rt;
	};
}());
window["cr_getC2Runtime"] = function()
{
	var canvas = document.getElementById("c2canvas");
	if (canvas)
		return canvas["c2runtime"];
	else if (window["c2runtime"])
		return window["c2runtime"];
}
window["cr_sizeCanvas"] = function(w, h)
{
	if (w === 0 || h === 0)
		return;
	var runtime = window["cr_getC2Runtime"]();
	if (runtime)
		runtime["setSize"](w, h);
}
window["cr_setSuspended"] = function(s)
{
	var runtime = window["cr_getC2Runtime"]();
	if (runtime)
		runtime["setSuspended"](s);
}
;
(function()
{
	function Layout(runtime, m)
	{
		this.runtime = runtime;
		this.event_sheet = null;
		this.scrollX = (this.runtime.original_width / 2);
		this.scrollY = (this.runtime.original_height / 2);
		this.scale = 1.0;
		this.angle = 0;
		this.name = m[0];
		this.width = m[1];
		this.height = m[2];
		this.unbounded_scrolling = m[3];
		this.sheetname = m[4];
		var lm = m[5];
		var i, len;
		this.layers = [];
		this.initial_types = [];
		for (i = 0, len = lm.length; i < len; i++)
		{
			var layer = new cr.layer(this, lm[i]);
			layer.number = i;
			cr.seal(layer);
			this.layers.push(layer);
		}
		var im = m[6];
		this.initial_nonworld = [];
		for (i = 0, len = im.length; i < len; i++)
		{
			var inst = im[i];
			var type = this.runtime.types_by_index[inst[1]];
;
			if (!type.default_instance)
				type.default_instance = inst;
			this.initial_nonworld.push(inst);
			if (this.initial_types.indexOf(type) === -1)
				this.initial_types.push(type);
		}
		this.effect_types = [];
		this.active_effect_types = [];
		this.effect_params = [];
		for (i = 0, len = m[7].length; i < len; i++)
		{
			this.effect_types.push({
				id: m[7][i][0],
				name: m[7][i][1],
				shaderindex: -1,
				active: true,
				index: i
			});
			this.effect_params.push(m[7][i][2].slice(0));
		}
		this.updateActiveEffects();
		this.rcTex = new cr.rect(0, 0, 1, 1);
		this.rcTex2 = new cr.rect(0, 0, 1, 1);
	};
	Layout.prototype.hasOpaqueBottomLayer = function ()
	{
		var layer = this.layers[0];
		return !layer.transparent && layer.opacity === 1.0 && !layer.forceOwnTexture && layer.visible;
	};
	Layout.prototype.updateActiveEffects = function ()
	{
		this.active_effect_types.length = 0;
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.active)
				this.active_effect_types.push(et);
		}
	};
	Layout.prototype.getEffectByName = function (name_)
	{
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.name === name_)
				return et;
		}
		return null;
	};
	Layout.prototype.startRunning = function ()
	{
		if (this.sheetname)
		{
			this.event_sheet = this.runtime.eventsheets[this.sheetname];
;
		}
		this.runtime.running_layout = this;
		this.scrollX = (this.runtime.original_width / 2);
		this.scrollY = (this.runtime.original_height / 2);
		var i, k, len, lenk, type, type_instances, inst;
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
		{
			type = this.runtime.types_by_index[i];
			if (type.is_family)
				continue;		// instances are only transferred for their real type
			type_instances = type.instances;
			for (k = 0, lenk = type_instances.length; k < lenk; k++)
			{
				inst = type_instances[k];
				if (inst.layer)
				{
					var num = inst.layer.number;
					if (num >= this.layers.length)
						num = this.layers.length - 1;
					inst.layer = this.layers[num];
					inst.layer.instances.push(inst);
					inst.layer.zindices_stale = true;
				}
			}
		}
		var layer;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			layer = this.layers[i];
			layer.createInitialInstances();
			layer.disableAngle = true;
			var px = layer.canvasToLayer(0, 0, true);
			var py = layer.canvasToLayer(0, 0, false);
			layer.disableAngle = false;
			if (this.runtime.pixel_rounding)
			{
				px = (px + 0.5) | 0;
				py = (py + 0.5) | 0;
			}
			layer.rotateViewport(px, py, null);
		}
		for (i = 0, len = this.initial_nonworld.length; i < len; i++)
		{
			inst = this.runtime.createInstanceFromInit(this.initial_nonworld[i], null, true);
;
		}
		/*
		if (this.runtime.glwrap)
		{
			console.log("Estimated VRAM between layouts: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
		}
		*/
		this.runtime.changelayout = null;
		this.runtime.ClearDeathRow();
		this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutStart, null);
	};
	Layout.prototype.createGlobalNonWorlds = function ()
	{
		var i, k, len, initial_inst, inst, type;
		for (i = 0, k = 0, len = this.initial_nonworld.length; i < len; i++)
		{
			initial_inst = this.initial_nonworld[i];
			type = this.runtime.types_by_index[initial_inst[1]];
			if (type.global)
				inst = this.runtime.createInstanceFromInit(initial_inst, null, true);
			else
			{
				this.initial_nonworld[k] = initial_inst;
				k++;
			}
		}
		this.initial_nonworld.length = k;
	};
	Layout.prototype.stopRunning = function ()
	{
;
/*
		if (this.runtime.glwrap)
		{
			console.log("Estimated VRAM at layout end: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
		}
*/
		this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutEnd, null);
		this.runtime.system.waits.length = 0;
		var i, leni, j, lenj;
		var layer_instances, inst, type;
		for (i = 0, leni = this.layers.length; i < leni; i++)
		{
			layer_instances = this.layers[i].instances;
			for (j = 0, lenj = layer_instances.length; j < lenj; j++)
			{
				inst = layer_instances[j];
				if (!inst.type.global)
					this.runtime.DestroyInstance(inst);
			}
			this.runtime.ClearDeathRow();
			layer_instances.length = 0;
			this.layers[i].zindices_stale = true;
		}
		for (i = 0, leni = this.runtime.types_by_index.length; i < leni; i++)
		{
			type = this.runtime.types_by_index[i];
			if (type.global || type.plugin.is_world || type.plugin.singleglobal)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
				this.runtime.DestroyInstance(type.instances[j]);
			this.runtime.ClearDeathRow();
		}
	};
	Layout.prototype.draw = function (ctx)
	{
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";
		if (this.runtime.clearBackground && !this.hasOpaqueBottomLayer())
			ctx.clearRect(0, 0, this.runtime.width, this.runtime.height);
		var i, len, l;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			l = this.layers[i];
			if (l.visible && l.opacity > 0 && l.blend_mode !== 11)
				l.draw(ctx);
		}
	};
	Layout.prototype.drawGL = function (glw)
	{
		var render_to_texture = (this.active_effect_types.length > 0 || this.runtime.uses_background_blending);
		if (render_to_texture)
		{
			if (!this.runtime.layout_tex)
			{
				this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
			}
			if (this.runtime.layout_tex.c2width !== this.runtime.width || this.runtime.layout_tex.c2height !== this.runtime.height)
			{
				glw.deleteTexture(this.runtime.layout_tex);
				this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
			}
			glw.setRenderingToTexture(this.runtime.layout_tex);
		}
		if (this.runtime.clearBackground && !this.hasOpaqueBottomLayer())
			glw.clear(0, 0, 0, 0);
		var i, len;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			if (this.layers[i].visible && this.layers[i].opacity > 0)
				this.layers[i].drawGL(glw);
		}
		if (render_to_texture)
		{
			if (this.active_effect_types.length <= 1)
			{
				if (this.active_effect_types.length === 1)
				{
					var etindex = this.active_effect_types[0].index;
					glw.switchProgram(this.active_effect_types[0].shaderindex);
					glw.setProgramParameters(null,								// backTex
											 1.0 / this.runtime.width,			// pixelWidth
											 1.0 / this.runtime.height,			// pixelHeight
											 0.0, 0.0,							// destStart
											 1.0, 1.0,							// destEnd
											 this.scale,						// layerScale
											 this.effect_params[etindex]);		// fx parameters
					if (glw.programIsAnimated(this.active_effect_types[0].shaderindex))
						this.runtime.redraw = true;
				}
				else
					glw.switchProgram(0);
				glw.setRenderingToTexture(null);				// to backbuffer
				glw.setOpacity(1);
				glw.setTexture(this.runtime.layout_tex);
				glw.setAlphaBlend();
				glw.resetModelView();
				glw.updateModelView();
				var halfw = this.runtime.width / 2;
				var halfh = this.runtime.height / 2;
				glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
				glw.setTexture(null);
			}
			else
			{
				this.renderEffectChain(glw, null, null, null);
			}
		}
		glw.present();
	};
	Layout.prototype.getRenderTarget = function()
	{
		return (this.active_effect_types.length > 0 || this.runtime.uses_background_blending) ? this.runtime.layout_tex : null;
	};
	Layout.prototype.getMinLayerScale = function ()
	{
		var m = this.layers[0].getScale();
		var i, len, l;
		for (i = 1, len = this.layers.length; i < len; i++)
		{
			l = this.layers[i];
			if (l.parallaxX === 0 && l.parallaxY === 0)
				continue;
			if (l.getScale() < m)
				m = l.getScale();
		}
		return m;
	};
	Layout.prototype.scrollToX = function (x)
	{
		if (!this.unbounded_scrolling)
		{
			var widthBoundary = (this.runtime.width * (1 / this.getMinLayerScale()) / 2);
			if (x > this.width - widthBoundary)
				x = this.width - widthBoundary;
			if (x < widthBoundary)
				x = widthBoundary;
		}
		if (this.scrollX !== x)
		{
			this.scrollX = x;
			this.runtime.redraw = true;
		}
	};
	Layout.prototype.scrollToY = function (y)
	{
		if (!this.unbounded_scrolling)
		{
			var heightBoundary = (this.runtime.height * (1 / this.getMinLayerScale()) / 2);
			if (y > this.height - heightBoundary)
				y = this.height - heightBoundary;
			if (y < heightBoundary)
				y = heightBoundary;
		}
		if (this.scrollY !== y)
		{
			this.scrollY = y;
			this.runtime.redraw = true;
		}
	};
	Layout.prototype.renderEffectChain = function (glw, layer, inst, rendertarget)
	{
		var active_effect_types = inst ?
							inst.active_effect_types :
							layer ?
								layer.active_effect_types :
								this.active_effect_types;
		var layerScale = inst ? inst.layer.getScale() :
							layer ? layer.getScale() : 1;
		var fx_tex = this.runtime.fx_tex;
		var i, len, last, temp, fx_index = 0, other_fx_index = 1;
		var y, h;
		var windowWidth = this.runtime.width;
		var windowHeight = this.runtime.height;
		var halfw = windowWidth / 2;
		var halfh = windowHeight / 2;
		var rcTex = layer ? layer.rcTex : this.rcTex;
		var rcTex2 = layer ? layer.rcTex2 : this.rcTex2;
		var screenleft = 0, clearleft = 0;
		var screentop = 0, cleartop = 0;
		var screenright = windowWidth, clearright = windowWidth;
		var screenbottom = windowHeight, clearbottom = windowHeight;
		var boxExtendHorizontal = 0;
		var boxExtendVertical = 0;
		var inst_layer_angle = inst ? inst.layer.getAngle() : 0;
		if (inst)
		{
			for (i = 0, len = active_effect_types.length; i < len; i++)
			{
				boxExtendHorizontal += glw.getProgramBoxExtendHorizontal(active_effect_types[i].shaderindex);
				boxExtendVertical += glw.getProgramBoxExtendVertical(active_effect_types[i].shaderindex);
			}
			var bbox = inst.bbox;
			screenleft = layer.layerToCanvas(bbox.left, bbox.top, true);
			screentop = layer.layerToCanvas(bbox.left, bbox.top, false);
			screenright = layer.layerToCanvas(bbox.right, bbox.bottom, true);
			screenbottom = layer.layerToCanvas(bbox.right, bbox.bottom, false);
			if (inst_layer_angle !== 0)
			{
				var screentrx = layer.layerToCanvas(bbox.right, bbox.top, true);
				var screentry = layer.layerToCanvas(bbox.right, bbox.top, false);
				var screenblx = layer.layerToCanvas(bbox.left, bbox.bottom, true);
				var screenbly = layer.layerToCanvas(bbox.left, bbox.bottom, false);
				temp = Math.min(screenleft, screenright, screentrx, screenblx);
				screenright = Math.max(screenleft, screenright, screentrx, screenblx);
				screenleft = temp;
				temp = Math.min(screentop, screenbottom, screentry, screenbly);
				screenbottom = Math.max(screentop, screenbottom, screentry, screenbly);
				screentop = temp;
			}
			screenleft -= boxExtendHorizontal;
			screentop -= boxExtendVertical;
			screenright += boxExtendHorizontal;
			screenbottom += boxExtendVertical;
			rcTex2.left = screenleft / windowWidth;
			rcTex2.top = 1 - screentop / windowHeight;
			rcTex2.right = screenright / windowWidth;
			rcTex2.bottom = 1 - screenbottom / windowHeight;
			clearleft = screenleft = Math.floor(screenleft);
			cleartop = screentop = Math.floor(screentop);
			clearright = screenright = Math.ceil(screenright);
			clearbottom = screenbottom = Math.ceil(screenbottom);
			clearleft -= boxExtendHorizontal;
			cleartop -= boxExtendVertical;
			clearright += boxExtendHorizontal;
			clearbottom += boxExtendVertical;
			if (screenleft < 0)					screenleft = 0;
			if (screentop < 0)					screentop = 0;
			if (screenright > windowWidth)		screenright = windowWidth;
			if (screenbottom > windowHeight)	screenbottom = windowHeight;
			if (clearleft < 0)					clearleft = 0;
			if (cleartop < 0)					cleartop = 0;
			if (clearright > windowWidth)		clearright = windowWidth;
			if (clearbottom > windowHeight)		clearbottom = windowHeight;
			rcTex.left = screenleft / windowWidth;
			rcTex.top = 1 - screentop / windowHeight;
			rcTex.right = screenright / windowWidth;
			rcTex.bottom = 1 - screenbottom / windowHeight;
		}
		else
		{
			rcTex.left = rcTex2.left = 0;
			rcTex.top = rcTex2.top = 0;
			rcTex.right = rcTex2.right = 1;
			rcTex.bottom = rcTex2.bottom = 1;
		}
		var pre_draw = (inst && (((inst.angle || inst_layer_angle) && glw.programUsesDest(active_effect_types[0].shaderindex)) || boxExtendHorizontal !== 0 || boxExtendVertical !== 0 || inst.opacity !== 1 || inst.type.plugin.must_predraw)) || (layer && !inst && layer.opacity !== 1);
		glw.setAlphaBlend();
		if (pre_draw)
		{
			if (!fx_tex[fx_index])
			{
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
			{
				glw.deleteTexture(fx_tex[fx_index]);
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			glw.switchProgram(0);
			glw.setRenderingToTexture(fx_tex[fx_index]);
			h = clearbottom - cleartop;
			y = (windowHeight - cleartop) - h;
			glw.clearRect(clearleft, y, clearright - clearleft, h);
			if (inst)
			{
				inst.drawGL(glw);
			}
			else
			{
				glw.setTexture(this.runtime.layer_tex);
				glw.setOpacity(layer.opacity);
				glw.resetModelView();
				glw.translate(-halfw, -halfh);
				glw.updateModelView();
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
			}
			rcTex2.left = rcTex2.top = 0;
			rcTex2.right = rcTex2.bottom = 1;
			if (inst)
			{
				temp = rcTex.top;
				rcTex.top = rcTex.bottom;
				rcTex.bottom = temp;
			}
			fx_index = 1;
			other_fx_index = 0;
		}
		glw.setOpacity(1);
		var last = active_effect_types.length - 1;
		var post_draw = glw.programUsesCrossSampling(active_effect_types[last].shaderindex);
		var etindex = 0;
		for (i = 0, len = active_effect_types.length; i < len; i++)
		{
			if (!fx_tex[fx_index])
			{
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
			{
				glw.deleteTexture(fx_tex[fx_index]);
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			glw.switchProgram(active_effect_types[i].shaderindex);
			etindex = active_effect_types[i].index;
			if (glw.programIsAnimated(active_effect_types[i].shaderindex))
				this.runtime.redraw = true;
			if (i == 0 && !pre_draw)
			{
				glw.setRenderingToTexture(fx_tex[fx_index]);
				h = clearbottom - cleartop;
				y = (windowHeight - cleartop) - h;
				glw.clearRect(clearleft, y, clearright - clearleft, h);
				if (inst)
				{
					glw.setProgramParameters(rendertarget,					// backTex
											 1.0 / inst.width,				// pixelWidth
											 1.0 / inst.height,				// pixelHeight
											 rcTex2.left, rcTex2.top,		// destStart
											 rcTex2.right, rcTex2.bottom,	// destEnd
											 layerScale,
											 inst.effect_params[etindex]);	// fx params
					inst.drawGL(glw);
				}
				else
				{
					glw.setProgramParameters(rendertarget,					// backTex
											 1.0 / windowWidth,				// pixelWidth
											 1.0 / windowHeight,			// pixelHeight
											 0.0, 0.0,						// destStart
											 1.0, 1.0,						// destEnd
											 layerScale,
											 layer ?						// fx params
												layer.effect_params[etindex] :
												this.effect_params[etindex]);
					glw.setTexture(layer ? this.runtime.layer_tex : this.runtime.layout_tex);
					glw.resetModelView();
					glw.translate(-halfw, -halfh);
					glw.updateModelView();
					glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
				}
				rcTex2.left = rcTex2.top = 0;
				rcTex2.right = rcTex2.bottom = 1;
				if (inst && !post_draw)
				{
					temp = screenbottom;
					screenbottom = screentop;
					screentop = temp;
				}
			}
			else
			{
				glw.setProgramParameters(rendertarget,						// backTex
										 1.0 / windowWidth,					// pixelWidth
										 1.0 / windowHeight,				// pixelHeight
										 rcTex2.left, rcTex2.top,			// destStart
										 rcTex2.right, rcTex2.bottom,		// destEnd
										 layerScale,
										 inst ?								// fx params
											inst.effect_params[etindex] :
											layer ?
												layer.effect_params[etindex] :
												this.effect_params[etindex]);
				if (i === last && !post_draw)
				{
					if (inst)
						glw.setBlend(inst.srcBlend, inst.destBlend);
					else if (layer)
						glw.setBlend(layer.srcBlend, layer.destBlend);
					glw.setRenderingToTexture(rendertarget);
				}
				else
				{
					glw.setRenderingToTexture(fx_tex[fx_index]);
					h = clearbottom - cleartop;
					y = (windowHeight - cleartop) - h;
					glw.clearRect(clearleft, y, clearright - clearleft, h);
				}
				glw.setTexture(fx_tex[other_fx_index]);
				glw.resetModelView();
				glw.translate(-halfw, -halfh);
				glw.updateModelView();
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
				if (i === last && !post_draw)
					glw.setTexture(null);
			}
			fx_index = (fx_index === 0 ? 1 : 0);
			other_fx_index = (fx_index === 0 ? 1 : 0);		// will be opposite to fx_index since it was just assigned
		}
		if (post_draw)
		{
			glw.switchProgram(0);
			if (inst)
				glw.setBlend(inst.srcBlend, inst.destBlend);
			else if (layer)
				glw.setBlend(layer.srcBlend, layer.destBlend);
			glw.setRenderingToTexture(rendertarget);
			glw.setTexture(fx_tex[other_fx_index]);
			glw.resetModelView();
			glw.translate(-halfw, -halfh);
			glw.updateModelView();
			if (inst && active_effect_types.length === 1 && !pre_draw)
				glw.quadTex(screenleft, screentop, screenright, screentop, screenright, screenbottom, screenleft, screenbottom, rcTex);
			else
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
			glw.setTexture(null);
		}
	};
	cr.layout = Layout;
	function Layer(layout, m)
	{
		this.layout = layout;
		this.runtime = layout.runtime;
		this.instances = [];        // running instances
		this.scale = 1.0;
		this.angle = 0;
		this.disableAngle = false;
		this.tmprect = new cr.rect(0, 0, 0, 0);
		this.tmpquad = new cr.quad();
		this.viewLeft = 0;
		this.viewRight = 0;
		this.viewTop = 0;
		this.viewBottom = 0;
		this.zindices_stale = false;
		this.name = m[0];
		this.index = m[1];
		this.visible = m[2];		// initially visible
		this.background_color = m[3];
		this.transparent = m[4];
		this.parallaxX = m[5];
		this.parallaxY = m[6];
		this.opacity = m[7];
		this.forceOwnTexture = m[8];
		this.zoomRate = m[9];
		this.blend_mode = m[10];
		this.effect_fallback = m[11];
		this.compositeOp = "source-over";
		this.srcBlend = 0;
		this.destBlend = 0;
		this.render_offscreen = false;
		var im = m[12];
		var i, len;
		this.initial_instances = [];
		for (i = 0, len = im.length; i < len; i++)
		{
			var inst = im[i];
			var type = this.runtime.types_by_index[inst[1]];
;
			if (!type.default_instance)
				type.default_instance = inst;
			this.initial_instances.push(inst);
			if (this.layout.initial_types.indexOf(type) === -1)
				this.layout.initial_types.push(type);
		}
		this.effect_types = [];
		this.active_effect_types = [];
		this.effect_params = [];
		for (i = 0, len = m[13].length; i < len; i++)
		{
			this.effect_types.push({
				id: m[13][i][0],
				name: m[13][i][1],
				shaderindex: -1,
				active: true,
				index: i
			});
			this.effect_params.push(m[13][i][2].slice(0));
		}
		this.updateActiveEffects();
		this.rcTex = new cr.rect(0, 0, 1, 1);
		this.rcTex2 = new cr.rect(0, 0, 1, 1);
	};
	Layer.prototype.updateActiveEffects = function ()
	{
		this.active_effect_types.length = 0;
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.active)
				this.active_effect_types.push(et);
		}
	};
	Layer.prototype.getEffectByName = function (name_)
	{
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.name === name_)
				return et;
		}
		return null;
	};
	var created_instances = [];
	Layer.prototype.createInitialInstances = function ()
	{
		created_instances.length = 0;
		var i, k, len, lenk, inst, t, iid, s;
		for (i = 0, k = 0, len = this.initial_instances.length; i < len; i++)
		{
			inst = this.runtime.createInstanceFromInit(this.initial_instances[i], this, true);
			created_instances.push(inst);
			if (inst && !inst.type.global)
			{
				this.initial_instances[k] = this.initial_instances[i];
				k++;
			}
		}
		this.initial_instances.length = k;
		this.runtime.ClearDeathRow();		// flushes creation row so IIDs will be correct
		for (i = 0; i < created_instances.length; i++)
		{
			inst = created_instances[i];
			if (!inst.type.is_contained)
				continue;
			iid = inst.get_iid();
			for (k = 0, lenk = inst.type.container.length; k < lenk; k++)
			{
				t = inst.type.container[k];
				if (inst.type === t)
					continue;
				if (t.instances.length > iid)
					inst.siblings.push(t.instances[iid]);
				else
				{
					if (!t.default_instance)
					{
					}
					else
					{
						s = this.runtime.createInstanceFromInit(t.default_instance, this, true, inst.x, inst.y, true);
						this.runtime.ClearDeathRow();
						t.updateIIDs();
						inst.siblings.push(s);
						created_instances.push(s);		// come back around and link up its own instances too
					}
				}
			}
		}
		if (!this.runtime.glwrap && this.effect_types.length)	// no WebGL renderer and shaders used
			this.blend_mode = this.effect_fallback;				// use fallback blend mode
		this.compositeOp = cr.effectToCompositeOp(this.blend_mode);
		if (this.runtime.gl)
			cr.setGLBlend(this, this.blend_mode, this.runtime.gl);
	};
	Layer.prototype.updateZIndices = function ()
	{
		if (!this.zindices_stale)
			return;
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
;
;
			this.instances[i].zindex = i;
		}
		this.zindices_stale = false;
	};
	Layer.prototype.getScale = function ()
	{
		return this.getNormalScale() * this.runtime.aspect_scale;
	};
	Layer.prototype.getNormalScale = function ()
	{
		return ((this.scale * this.layout.scale) - 1) * this.zoomRate + 1;
	};
	Layer.prototype.getAngle = function ()
	{
		if (this.disableAngle)
			return 0;
		return cr.clamp_angle(this.layout.angle + this.angle);
	};
	Layer.prototype.draw = function (ctx)
	{
		this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.blend_mode !== 0);
		var layer_canvas = this.runtime.canvas;
		var layer_ctx = ctx;
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";
		if (this.render_offscreen)
		{
			if (!this.runtime.layer_canvas)
			{
				this.runtime.layer_canvas = document.createElement("canvas");
;
				layer_canvas = this.runtime.layer_canvas;
				layer_canvas.width = this.runtime.width;
				layer_canvas.height = this.runtime.height;
				this.runtime.layer_ctx = layer_canvas.getContext("2d");
;
			}
			layer_canvas = this.runtime.layer_canvas;
			layer_ctx = this.runtime.layer_ctx;
			if (layer_canvas.width !== this.runtime.width)
				layer_canvas.width = this.runtime.width;
			if (layer_canvas.height !== this.runtime.height)
				layer_canvas.height = this.runtime.height;
			if (this.transparent)
				layer_ctx.clearRect(0, 0, this.runtime.width, this.runtime.height);
		}
		if (!this.transparent)
		{
			layer_ctx.fillStyle = "rgb(" + this.background_color[0] + "," + this.background_color[1] + "," + this.background_color[2] + ")";
			layer_ctx.fillRect(0, 0, this.runtime.width, this.runtime.height);
		}
		layer_ctx.save();
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true);
		var py = this.canvasToLayer(0, 0, false);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding)
		{
			px = (px + 0.5) | 0;
			py = (py + 0.5) | 0;
		}
		this.rotateViewport(px, py, layer_ctx);
		var myscale = this.getScale();
		layer_ctx.scale(myscale, myscale);
		layer_ctx.translate(-px, -py);
		var i, len, inst, bbox;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			if (!inst.visible || inst.width === 0 || inst.height === 0)
				continue;
			inst.update_bbox();
			bbox = inst.bbox;
			if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
				continue;
			layer_ctx.globalCompositeOperation = inst.compositeOp;
			inst.draw(layer_ctx);
		}
		layer_ctx.restore();
		if (this.render_offscreen)
		{
			ctx.globalCompositeOperation = this.compositeOp;
			ctx.globalAlpha = this.opacity;
			ctx.drawImage(layer_canvas, 0, 0);
		}
	};
	Layer.prototype.rotateViewport = function (px, py, ctx)
	{
		var myscale = this.getScale();
		this.viewLeft = px;
		this.viewTop = py;
		this.viewRight = px + (this.runtime.width * (1 / myscale));
		this.viewBottom = py + (this.runtime.height * (1 / myscale));
		var myAngle = this.getAngle();
		if (myAngle !== 0)
		{
			if (ctx)
			{
				ctx.translate(this.runtime.width / 2, this.runtime.height / 2);
				ctx.rotate(-myAngle);
				ctx.translate(this.runtime.width / -2, this.runtime.height / -2);
			}
			this.tmprect.set(this.viewLeft, this.viewTop, this.viewRight, this.viewBottom);
			this.tmprect.offset((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
			this.tmpquad.set_from_rotated_rect(this.tmprect, myAngle);
			this.tmpquad.bounding_box(this.tmprect);
			this.tmprect.offset((this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2);
			this.viewLeft = this.tmprect.left;
			this.viewTop = this.tmprect.top;
			this.viewRight = this.tmprect.right;
			this.viewBottom = this.tmprect.bottom;
		}
	}
	Layer.prototype.drawGL = function (glw)
	{
		var windowWidth = this.runtime.width;
		var windowHeight = this.runtime.height;
		var shaderindex = 0;
		var etindex = 0;
		this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.active_effect_types.length > 0 || this.blend_mode !== 0);
		if (this.render_offscreen)
		{
			if (!this.runtime.layer_tex)
			{
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
			}
			if (this.runtime.layer_tex.c2width !== this.runtime.width || this.runtime.layer_tex.c2height !== this.runtime.height)
			{
				glw.deleteTexture(this.runtime.layer_tex);
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
			}
			glw.setRenderingToTexture(this.runtime.layer_tex);
			if (this.transparent)
				glw.clear(0, 0, 0, 0);
		}
		if (!this.transparent)
		{
			glw.clear(this.background_color[0] / 255, this.background_color[1] / 255, this.background_color[2] / 255, 1);
		}
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true);
		var py = this.canvasToLayer(0, 0, false);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding)
		{
			px = (px + 0.5) | 0;
			py = (py + 0.5) | 0;
		}
		this.rotateViewport(px, py, null);
		var myscale = this.getScale();
		glw.resetModelView();
		glw.scale(myscale, myscale);
		glw.rotateZ(-this.getAngle());
		glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
		glw.updateModelView();
		var i, len, inst, bbox;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			if (!inst.visible || inst.width === 0 || inst.height === 0)
				continue;
			inst.update_bbox();
			bbox = inst.bbox;
			if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
				continue;
			if (inst.uses_shaders)
			{
				shaderindex = inst.active_effect_types[0].shaderindex;
				etindex = inst.active_effect_types[0].index;
				if (inst.active_effect_types.length === 1 && !glw.programUsesCrossSampling(shaderindex) &&
					!glw.programExtendsBox(shaderindex) && ((!inst.angle && !inst.layer.getAngle()) || !glw.programUsesDest(shaderindex)) &&
					inst.opacity === 1 && !inst.type.plugin.must_predraw)
				{
					glw.switchProgram(shaderindex);
					glw.setBlend(inst.srcBlend, inst.destBlend);
					if (glw.programIsAnimated(shaderindex))
						this.runtime.redraw = true;
					var destStartX = 0, destStartY = 0, destEndX = 0, destEndY = 0;
					if (glw.programUsesDest(shaderindex))
					{
						var bbox = inst.bbox;
						var screenleft = this.layerToCanvas(bbox.left, bbox.top, true);
						var screentop = this.layerToCanvas(bbox.left, bbox.top, false);
						var screenright = this.layerToCanvas(bbox.right, bbox.bottom, true);
						var screenbottom = this.layerToCanvas(bbox.right, bbox.bottom, false);
						destStartX = screenleft / windowWidth;
						destStartY = 1 - screentop / windowHeight;
						destEndX = screenright / windowWidth;
						destEndY = 1 - screenbottom / windowHeight;
					}
					glw.setProgramParameters(this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget(), // backTex
											 1.0 / inst.width,			// pixelWidth
											 1.0 / inst.height,			// pixelHeight
											 destStartX, destStartY,
											 destEndX, destEndY,
											 this.getScale(),
											 inst.effect_params[etindex]);
					inst.drawGL(glw);
				}
				else
				{
					this.layout.renderEffectChain(glw, this, inst, this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget());
					glw.resetModelView();
					glw.scale(myscale, myscale);
					glw.rotateZ(-this.getAngle());
					glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
					glw.updateModelView();
				}
			}
			else
			{
				glw.switchProgram(0);		// un-set any previously set shader
				glw.setBlend(inst.srcBlend, inst.destBlend);
				inst.drawGL(glw);
			}
		}
		if (this.render_offscreen)
		{
			shaderindex = this.active_effect_types.length ? this.active_effect_types[0].shaderindex : 0;
			etindex = this.active_effect_types.length ? this.active_effect_types[0].index : 0;
			if (this.active_effect_types.length === 0 || (this.active_effect_types.length === 1 &&
				!glw.programUsesCrossSampling(shaderindex) && this.opacity === 1))
			{
				if (this.active_effect_types.length === 1)
				{
					glw.switchProgram(shaderindex);
					glw.setProgramParameters(this.layout.getRenderTarget(),		// backTex
											 1.0 / this.runtime.width,			// pixelWidth
											 1.0 / this.runtime.height,			// pixelHeight
											 0.0, 0.0,							// destStart
											 1.0, 1.0,							// destEnd
											 this.getScale(),					// layerScale
											 this.effect_params[etindex]);		// fx parameters
					if (glw.programIsAnimated(shaderindex))
						this.runtime.redraw = true;
				}
				else
					glw.switchProgram(0);
				glw.setRenderingToTexture(this.layout.getRenderTarget());
				glw.setOpacity(this.opacity);
				glw.setTexture(this.runtime.layer_tex);
				glw.setBlend(this.srcBlend, this.destBlend);
				glw.resetModelView();
				glw.updateModelView();
				var halfw = this.runtime.width / 2;
				var halfh = this.runtime.height / 2;
				glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
				glw.setTexture(null);
			}
			else
			{
				this.layout.renderEffectChain(glw, this, null, this.layout.getRenderTarget());
			}
		}
	};
	Layer.prototype.canvasToLayer = function (ptx, pty, getx)
	{
		var isiOSRetina = (!this.runtime.isDomFree && this.runtime.useiOSRetina && this.runtime.isiOS);
		var multiplier = this.runtime.devicePixelRatio;
		if (isiOSRetina && this.runtime.fullscreen_mode > 0)
		{
			ptx *= multiplier;
			pty *= multiplier;
		}
		var ox = (this.runtime.original_width / 2);
		var oy = (this.runtime.original_height / 2);
		var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
		var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
		var invScale = 1 / this.getScale();
		x -= (this.runtime.width * invScale) / 2;
		y -= (this.runtime.height * invScale) / 2;
		x += ptx * invScale;
		y += pty * invScale;
		var a = this.getAngle();
		if (a !== 0)
		{
			x -= this.layout.scrollX;
			y -= this.layout.scrollY;
			var cosa = Math.cos(a);
			var sina = Math.sin(a);
			var x_temp = (x * cosa) - (y * sina);
			y = (y * cosa) + (x * sina);
			x = x_temp;
			x += this.layout.scrollX;
			y += this.layout.scrollY;
		}
		return getx ? x : y;
	};
	Layer.prototype.layerToCanvas = function (ptx, pty, getx)
	{
		var a = this.getAngle();
		if (a !== 0)
		{
			ptx -= this.layout.scrollX;
			pty -= this.layout.scrollY;
			var cosa = Math.cos(-a);
			var sina = Math.sin(-a);
			var x_temp = (ptx * cosa) - (pty * sina);
			pty = (pty * cosa) + (ptx * sina);
			ptx = x_temp;
			ptx += this.layout.scrollX;
			pty += this.layout.scrollY;
		}
		var ox = (this.runtime.original_width / 2);
		var oy = (this.runtime.original_height / 2);
		var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
		var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
		var invScale = 1 / this.getScale();
		x -= (this.runtime.width * invScale) / 2;
		y -= (this.runtime.height * invScale) / 2;
		x = (ptx - x) / invScale;
		y = (pty - y) / invScale;
		var isiOSRetina = (!this.runtime.isDomFree && this.runtime.useiOSRetina && this.runtime.isiOS);
		var multiplier = this.runtime.devicePixelRatio;
		if (isiOSRetina && this.runtime.fullscreen_mode > 0)
		{
			x /= multiplier;
			y /= multiplier;
		}
		return getx ? x : y;
	};
	cr.layer = Layer;
}());
;
(function()
{
	var allUniqueSolModifiers = [];
	function testSolsMatch(arr1, arr2)
	{
		var i, len = arr1.length;
		switch (len) {
		case 0:
			return true;
		case 1:
			return arr1[0] === arr2[0];
		case 2:
			return arr1[0] === arr2[0] && arr1[1] === arr2[1];
		default:
			for (i = 0; i < len; i++)
			{
				if (arr1[i] !== arr2[i])
					return false;
			}
			return true;
		}
	};
	function solArraySorter(t1, t2)
	{
		return t1.index - t2.index;
	};
	function findMatchingSolModifier(arr)
	{
		var i, len, u, temp, subarr;
		if (arr.length === 2)
		{
			if (arr[0].index > arr[1].index)
			{
				temp = arr[0];
				arr[0] = arr[1];
				arr[1] = temp;
			}
		}
		else if (arr.length > 2)
			arr.sort(solArraySorter);		// so testSolsMatch compares in same order
		if (arr.length >= allUniqueSolModifiers.length)
			allUniqueSolModifiers.length = arr.length + 1;
		if (!allUniqueSolModifiers[arr.length])
			allUniqueSolModifiers[arr.length] = [];
		subarr = allUniqueSolModifiers[arr.length];
		for (i = 0, len = subarr.length; i < len; i++)
		{
			u = subarr[i];
			if (testSolsMatch(arr, u))
				return u;
		}
		subarr.push(arr);
		return arr;
	};
	function EventSheet(runtime, m)
	{
		this.runtime = runtime;
		this.triggers = {};
		this.fasttriggers = {};
        this.hasRun = false;
        this.includes = new cr.ObjectSet(); // all event sheets included by this sheet, at first-level indirection only
		this.name = m[0];
		var em = m[1];		// events model
		this.events = [];       // triggers won't make it to this array
		var i, len;
		for (i = 0, len = em.length; i < len; i++)
			this.init_event(em[i], null, this.events);
	};
    EventSheet.prototype.toString = function ()
    {
        return this.name;
    };
	EventSheet.prototype.init_event = function (m, parent, nontriggers)
	{
		switch (m[0]) {
		case 0:	// event block
		{
			var block = new cr.eventblock(this, parent, m);
			cr.seal(block);
			if (block.orblock)
			{
				nontriggers.push(block);
				var i, len;
				for (i = 0, len = block.conditions.length; i < len; i++)
				{
					if (block.conditions[i].trigger)
						this.init_trigger(block, i);
				}
			}
			else
			{
				if (block.is_trigger())
					this.init_trigger(block, 0);
				else
					nontriggers.push(block);
			}
			break;
		}
		case 1: // variable
		{
			var v = new cr.eventvariable(this, parent, m);
			cr.seal(v);
			nontriggers.push(v);
			break;
		}
        case 2:	// include
        {
            var inc = new cr.eventinclude(this, parent, m);
			cr.seal(inc);
            nontriggers.push(inc);
			break;
        }
		default:
;
		}
	};
	EventSheet.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++)
		{
			this.events[i].postInit(i < len - 1 && this.events[i + 1].is_else_block);
		}
	};
	EventSheet.prototype.run = function ()
	{
        this.hasRun = true;
		this.runtime.isRunningEvents = true;
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++)
		{
			var ev = this.events[i];
			ev.run();
			this.runtime.clearSol(ev.solModifiers);
			if (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length)
				this.runtime.ClearDeathRow();
		}
		this.runtime.isRunningEvents = false;
	};
	EventSheet.prototype.init_trigger = function (trig, index)
	{
		if (!trig.orblock)
			this.runtime.triggers_to_postinit.push(trig);	// needs to be postInit'd later
		var i, len;
		var cnd = trig.conditions[index];
		var type_name;
		if (cnd.type)
			type_name = cnd.type.name;
		else
			type_name = "system";
		var fasttrigger = cnd.fasttrigger;
		var triggers = (fasttrigger ? this.fasttriggers : this.triggers);
		if (!triggers[type_name])
			triggers[type_name] = [];
		var obj_entry = triggers[type_name];
		var method = cnd.func;
		if (fasttrigger)
		{
			if (!cnd.parameters.length)				// no parameters
				return;
			var firstparam = cnd.parameters[0];
			if (firstparam.type !== 1 ||			// not a string param
				firstparam.expression.type !== 2)	// not a string literal node
			{
				return;
			}
			var fastevs;
			var firstvalue = firstparam.expression.value.toLowerCase();
			var i, len;
			for (i = 0, len = obj_entry.length; i < len; i++)
			{
				if (obj_entry[i].method == method)
				{
					fastevs = obj_entry[i].evs;
					if (!fastevs[firstvalue])
						fastevs[firstvalue] = [[trig, index]];
					else
						fastevs[firstvalue].push([trig, index]);
					return;
				}
			}
			fastevs = {};
			fastevs[firstvalue] = [[trig, index]];
			obj_entry.push({ method: method, evs: fastevs });
		}
		else
		{
			for (i = 0, len = obj_entry.length; i < len; i++)
			{
				if (obj_entry[i].method == method)
				{
					obj_entry[i].evs.push([trig, index]);
					return;
				}
			}
			obj_entry.push({ method: method, evs: [[trig, index]]});
		}
	};
	cr.eventsheet = EventSheet;
	function Selection(type)
	{
		this.type = type;
		this.instances = [];        // subset of picked instances
		this.else_instances = [];	// subset of unpicked instances
		this.select_all = true;
	};
	Selection.prototype.hasObjects = function ()
	{
		if (this.select_all)
			return this.type.instances.length;
		else
			return this.instances.length;
	};
	Selection.prototype.getObjects = function ()
	{
		if (this.select_all)
			return this.type.instances;
		else
			return this.instances;
	};
	/*
	Selection.prototype.ensure_picked = function (inst, skip_siblings)
	{
		var i, len;
		var orblock = inst.runtime.getCurrentEventStack().current_event.orblock;
		if (this.select_all)
		{
			this.select_all = false;
			if (orblock)
			{
				cr.shallowAssignArray(this.else_instances, inst.type.instances);
				cr.arrayFindRemove(this.else_instances, inst);
			}
			this.instances.length = 1;
			this.instances[0] = inst;
		}
		else
		{
			if (orblock)
			{
				i = this.else_instances.indexOf(inst);
				if (i !== -1)
				{
					this.instances.push(this.else_instances[i]);
					this.else_instances.splice(i, 1);
				}
			}
			else
			{
				if (this.instances.indexOf(inst) === -1)
					this.instances.push(inst);
			}
		}
		if (!skip_siblings)
		{
		}
	};
	*/
	Selection.prototype.pick_one = function (inst)
	{
		if (!inst)
			return;
		if (inst.runtime.getCurrentEventStack().current_event.orblock)
		{
			if (this.select_all)
			{
				this.instances.length = 0;
				cr.shallowAssignArray(this.else_instances, inst.type.instances);
				this.select_all = false;
			}
			var i = this.else_instances.indexOf(inst);
			if (i !== -1)
			{
				this.instances.push(this.else_instances[i]);
				this.else_instances.splice(i, 1);
			}
		}
		else
		{
			this.select_all = false;
			this.instances.length = 1;
			this.instances[0] = inst;
		}
	};
	cr.selection = Selection;
	function EventBlock(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.solModifiersIncludingParents = [];
		this.solWriterAfterCnds = false;	// block does not change SOL after running its conditions
		this.group = false;					// is group of events
		this.initially_activated = false;	// if a group, is active on startup
		this.toplevelevent = false;			// is an event block parented only by a top-level group
		this.toplevelgroup = false;			// is parented only by other groups or is top-level (i.e. not in a subevent)
		this.has_else_block = false;		// is followed by else
;
		this.conditions = [];
		this.actions = [];
		this.subevents = [];
        if (m[1])
        {
			this.group_name = m[1][1].toLowerCase();
			this.group = true;
			this.initially_activated = !!m[1][0];
			this.runtime.allGroups.push(this);
            this.runtime.activeGroups[(/*this.sheet.name + "|" + */this.group_name).toLowerCase()] = this.initially_activated;
        }
		else
		{
			this.group_name = "";
			this.group = false;
			this.initially_activated = false;
		}
		this.orblock = m[2];
		var i, len;
		var cm = m[3];
		for (i = 0, len = cm.length; i < len; i++)
		{
			var cnd = new cr.condition(this, cm[i]);
			cr.seal(cnd);
			this.conditions.push(cnd);
			/*
			if (cnd.is_logical())
				this.is_logical = true;
			if (cnd.type && !cnd.type.plugin.singleglobal && this.cndReferences.indexOf(cnd.type) === -1)
				this.cndReferences.push(cnd.type);
			*/
			this.addSolModifier(cnd.type);
		}
		var am = m[4];
		for (i = 0, len = am.length; i < len; i++)
		{
			var act = new cr.action(this, am[i]);
			cr.seal(act);
			this.actions.push(act);
		}
		if (m.length === 6)
		{
			var em = m[5];
			for (i = 0, len = em.length; i < len; i++)
				this.sheet.init_event(em[i], this, this.subevents);
		}
		this.is_else_block = false;
		if (this.conditions.length)
			this.is_else_block = (this.conditions[0].type == null && this.conditions[0].func == cr.system_object.prototype.cnds.Else);
	};
	EventBlock.prototype.postInit = function (hasElse/*, prevBlock_*/)
	{
		var i, len;
		var p = this.parent;
		if (this.group)
		{
			this.toplevelgroup = true;
			while (p)
			{
				if (!p.group)
				{
					this.toplevelgroup = false;
					break;
				}
				p = p.parent;
			}
		}
		this.toplevelevent = !this.is_trigger() && (!this.parent || (this.parent.group && this.parent.toplevelgroup));
		this.has_else_block = !!hasElse;
		this.solModifiersIncludingParents = this.solModifiers.slice(0);
		p = this.parent;
		while (p)
		{
			for (i = 0, len = p.solModifiers.length; i < len; i++)
				this.addParentSolModifier(p.solModifiers[i]);
			p = p.parent;
		}
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
		this.solModifiersIncludingParents = findMatchingSolModifier(this.solModifiersIncludingParents);
		var i, len/*, s*/;
		for (i = 0, len = this.conditions.length; i < len; i++)
			this.conditions[i].postInit();
		for (i = 0, len = this.actions.length; i < len; i++)
			this.actions[i].postInit();
		for (i = 0, len = this.subevents.length; i < len; i++)
		{
			this.subevents[i].postInit(i < len - 1 && this.subevents[i + 1].is_else_block);
		}
		/*
		if (this.is_else_block && this.prev_block)
		{
			for (i = 0, len = this.prev_block.solModifiers.length; i < len; i++)
			{
				s = this.prev_block.solModifiers[i];
				if (this.solModifiers.indexOf(s) === -1)
					this.solModifiers.push(s);
			}
		}
		*/
	}
	function addSolModifierToList(type, arr)
	{
		var i, len, t;
		if (!type)
			return;
		if (arr.indexOf(type) === -1)
			arr.push(type);
		if (type.is_contained)
		{
			for (i = 0, len = type.container.length; i < len; i++)
			{
				t = type.container[i];
				if (type === t)
					continue;		// already handled
				if (arr.indexOf(t) === -1)
					arr.push(t);
			}
		}
	};
	EventBlock.prototype.addSolModifier = function (type)
	{
		addSolModifierToList(type, this.solModifiers);
	};
	EventBlock.prototype.addParentSolModifier = function (type)
	{
		addSolModifierToList(type, this.solModifiersIncludingParents);
	};
	EventBlock.prototype.setSolWriterAfterCnds = function ()
	{
		this.solWriterAfterCnds = true;
		if (this.parent)
			this.parent.setSolWriterAfterCnds();
	};
	EventBlock.prototype.is_trigger = function ()
	{
		if (!this.conditions.length)    // no conditions
			return false;
		else
			return this.conditions[0].trigger;
	};
	EventBlock.prototype.run = function ()
	{
		var i, len, any_true = false/*, bail = false*/;
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		if (!this.is_else_block)
			evinfo.else_branch_ran = false;
		if (this.orblock)
		{
			if (this.conditions.length === 0)
				any_true = true;		// be sure to run if empty block
			for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				if (this.conditions[evinfo.cndindex].trigger)		// skip triggers when running OR block
					continue;
				if (this.conditions[evinfo.cndindex].run())			// make sure all conditions run and run if any were true
					any_true = true;
			}
			evinfo.last_event_true = any_true;
			if (any_true)
				this.run_actions_and_subevents();
		}
		else
		{
			for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				if (!this.conditions[evinfo.cndindex].run())    // condition failed
				{
					evinfo.last_event_true = false;
					return;										// bail out now
				}
			}
			evinfo.last_event_true = true;
			this.run_actions_and_subevents();
		}
		if (evinfo.last_event_true && this.has_else_block)
			evinfo.else_branch_ran = true;
		if (this.toplevelevent && (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length))
			this.runtime.ClearDeathRow();
	};
	EventBlock.prototype.run_orblocktrigger = function (index)
	{
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		if (this.conditions[index].run())
		{
			this.run_actions_and_subevents();
		}
	};
	EventBlock.prototype.run_actions_and_subevents = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (evinfo.actindex = 0, len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
		{
			if (this.actions[evinfo.actindex].run())
				return;
		}
		this.run_subevents();
	};
	EventBlock.prototype.resume_actions_and_subevents = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
		{
			if (this.actions[evinfo.actindex].run())
				return;
		}
		this.run_subevents();
	};
	EventBlock.prototype.run_subevents = function ()
	{
		if (!this.subevents.length)
			return;
		var i, len, subev, pushpop/*, skipped_pop = false, pop_modifiers = null*/;
		var last = this.subevents.length - 1;
		this.runtime.pushEventStack(this);
		if (this.solWriterAfterCnds)
		{
			for (i = 0, len = this.subevents.length; i < len; i++)
			{
				subev = this.subevents[i];
				pushpop = (!this.toplevelgroup || (!this.group && i < last));
				if (pushpop)
					this.runtime.pushCopySol(subev.solModifiers);
				subev.run();
				if (pushpop)
					this.runtime.popSol(subev.solModifiers);
				else
					this.runtime.clearSol(subev.solModifiers);
			}
		}
		else
		{
			for (i = 0, len = this.subevents.length; i < len; i++)
			{
				this.subevents[i].run();
			}
		}
		this.runtime.popEventStack();
	};
	EventBlock.prototype.run_pretrigger = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		var any_true = false;
		var i, len;
		for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
		{
;
			if (this.conditions[evinfo.cndindex].run())
				any_true = true;
			else if (!this.orblock)			// condition failed (let OR blocks run all conditions anyway)
				return false;               // bail out
		}
		return this.orblock ? any_true : true;
	};
	EventBlock.prototype.retrigger = function ()
	{
		this.runtime.execcount++;
		var prevcndindex = this.runtime.getCurrentEventStack().cndindex;
		var len;
		var evinfo = this.runtime.pushEventStack(this);
		if (!this.orblock)
		{
			for (evinfo.cndindex = prevcndindex + 1, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				if (!this.conditions[evinfo.cndindex].run())    // condition failed
				{
					this.runtime.popEventStack();               // moving up level of recursion
					return false;                               // bail out
				}
			}
		}
		this.run_actions_and_subevents();
		this.runtime.popEventStack();
		return true;		// ran an iteration
	};
	cr.eventblock = EventBlock;
	function Condition(block, m)
	{
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};		// for plugins to stow away some custom info
		this.func = m[1];
;
		this.trigger = (m[3] > 0);
		this.fasttrigger = (m[3] === 2);
		this.looping = m[4];
		this.inverted = m[5];
		this.isstatic = m[6];
		if (m[0] === -1)		// system object
		{
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1;
		}
		else
		{
			this.type = this.runtime.types_by_index[m[0]];
;
			if (this.isstatic)
				this.run = this.run_static;
			else
				this.run = this.run_object;
			if (m[2])
			{
				this.behaviortype = this.type.getBehaviorByName(m[2]);
;
				this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
			}
			else
			{
				this.behaviortype = null;
				this.beh_index = -1;
			}
			if (this.block.parent)
				this.block.parent.setSolWriterAfterCnds();
		}
		if (this.fasttrigger)
			this.run = this.run_true;
		if (m.length === 8)
		{
			var i, len;
			var em = m[7];
			for (i = 0, len = em.length; i < len; i++)
			{
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param);
			}
			this.results.length = em.length;
		}
	};
	Condition.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.parameters[i].postInit();
	};
	/*
	Condition.prototype.is_logical = function ()
	{
		return !this.type || this.type.plugin.singleglobal;
	};
	*/
	Condition.prototype.run_true = function ()
	{
		return true;
	};
	Condition.prototype.run_system = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		return cr.xor(this.func.apply(this.runtime.system, this.results), this.inverted);
	};
	Condition.prototype.run_static = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		var ret = this.func.apply(this.type, this.results);
		this.type.applySolToContainer();
		return ret;
	};
	Condition.prototype.run_object = function ()
	{
		var i, j, leni, lenj, ret, met, inst, s, sol2;
		var sol = this.type.getCurrentSol();
		var is_orblock = this.block.orblock && !this.trigger;		// triggers in OR blocks need to work normally
		var offset = 0;
		var is_contained = this.type.is_contained;
		if (sol.select_all) {
			sol.instances.length = 0;       // clear contents
			sol.else_instances.length = 0;
			for (i = 0, leni = this.type.instances.length; i < leni; i++)
			{
				inst = this.type.instances[i];
;
				for (j = 0, lenj = this.parameters.length; j < lenj; j++)
					this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
				if (this.beh_index > -1)
				{
					if (this.type.is_family)
					{
						offset = inst.type.family_beh_map[this.type.family_index];
					}
					ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
				}
				else
					ret = this.func.apply(inst, this.results);
				met = cr.xor(ret, this.inverted);
				if (met)
					sol.instances.push(inst);
				else if (is_orblock)					// in OR blocks, keep the instances not meeting the condition for subsequent testing
					sol.else_instances.push(inst);
			}
			if (this.type.finish)
				this.type.finish(true);
			sol.select_all = false;
			this.type.applySolToContainer();
			return sol.hasObjects();
		}
		else {
			var k = 0;
			var arr = (is_orblock ? sol.else_instances : sol.instances);
			var any_true = false;
			for (i = 0, leni = arr.length; i < leni; i++)
			{
				inst = arr[i];
;
				for (j = 0, lenj = this.parameters.length; j < lenj; j++)
					this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
				if (this.beh_index > -1)
				{
					if (this.type.is_family)
					{
						offset = inst.type.family_beh_map[this.type.family_index];
					}
					ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
				}
				else
					ret = this.func.apply(inst, this.results);
				if (cr.xor(ret, this.inverted))
				{
					any_true = true;
					if (is_orblock)
					{
						sol.instances.push(inst);
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().instances.push(s);
							}
						}
					}
					else
					{
						arr[k] = inst;
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().instances[k] = s;
							}
						}
						k++;
					}
				}
				else
				{
					if (is_orblock)
					{
						arr[k] = inst;
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances[k] = s;
							}
						}
						k++;
					}
				}
			}
			arr.length = k;
			if (is_contained)
			{
				for (i = 0, leni = this.type.container.length; i < leni; i++)
				{
					sol2 = this.type.container[i].getCurrentSol();
					if (is_orblock)
						sol2.else_instances.length = k;
					else
						sol2.instances.length = k;
				}
			}
			var pick_in_finish = any_true;		// don't pick in finish() if we're only doing the logic test below
			if (is_orblock && !any_true)
			{
				for (i = 0, leni = sol.instances.length; i < leni; i++)
				{
					inst = sol.instances[i];
					for (j = 0, lenj = this.parameters.length; j < lenj; j++)
						this.results[j] = this.parameters[j].get(i);
					if (this.beh_index > -1)
						ret = this.func.apply(inst.behavior_insts[this.beh_index], this.results);
					else
						ret = this.func.apply(inst, this.results);
					if (cr.xor(ret, this.inverted))
					{
						any_true = true;
						break;		// got our flag, don't need to test any more
					}
				}
			}
			if (this.type.finish)
				this.type.finish(pick_in_finish || is_orblock);
			return is_orblock ? any_true : sol.hasObjects();
		}
	};
	cr.condition = Condition;
	function Action(block, m)
	{
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};		// for plugins to stow away some custom info
		this.func = m[1];
;
		if (m[0] === -1)	// system
		{
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1;
		}
		else
		{
			this.type = this.runtime.types_by_index[m[0]];
;
			this.run = this.run_object;
			if (m[2])
			{
				this.behaviortype = this.type.getBehaviorByName(m[2]);
;
				this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
			}
			else
			{
				this.behaviortype = null;
				this.beh_index = -1;
			}
		}
		if (m.length === 4)
		{
			var i, len;
			var em = m[3];
			for (i = 0, len = em.length; i < len; i++)
			{
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param);
			}
			this.results.length = em.length;
		}
	};
	Action.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.parameters[i].postInit();
	};
	Action.prototype.run_system = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		return this.func.apply(this.runtime.system, this.results);
	};
	Action.prototype.run_object = function ()
	{
		var instances = this.type.getCurrentSol().getObjects();
		var i, j, leni, lenj, inst;
		for (i = 0, leni = instances.length; i < leni; i++)
		{
			inst = instances[i];
			for (j = 0, lenj = this.parameters.length; j < lenj; j++)
				this.results[j] = this.parameters[j].get(i);    // pass i to use as default SOL index
			if (this.beh_index > -1)
			{
				var offset = 0;
				if (this.type.is_family)
				{
					offset = inst.type.family_beh_map[this.type.family_index];
				}
				this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
			}
			else
				this.func.apply(inst, this.results);
		}
		return false;
	};
	cr.action = Action;
	var tempValues = [];
	var tempValuesPtr = -1;
	function Parameter(owner, m)
	{
		this.owner = owner;
		this.block = owner.block;
		this.sheet = owner.sheet;
		this.runtime = owner.runtime;
		this.type = m[0];
		this.expression = null;
		this.solindex = 0;
		this.combosel = 0;
		this.layout = null;
		this.key = 0;
		this.object = null;
		this.index = 0;
		this.varname = null;
		this.eventvar = null;
		this.fileinfo = null;
		this.subparams = null;
		this.variadicret = null;
		var i, len, param;
		switch (m[0])
		{
			case 0:		// number
			case 7:		// any
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_exp;
				break;
			case 1:		// string
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_exp_str;
				break;
			case 5:		// layer
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_layer;
				break;
			case 3:		// combo
			case 8:		// cmp
				this.combosel = m[1];
				this.get = this.get_combosel;
				break;
			case 6:		// layout
				this.layout = this.runtime.layouts[m[1]];
;
				this.get = this.get_layout;
				break;
			case 9:		// keyb
				this.key = m[1];
				this.get = this.get_key;
				break;
			case 4:		// object
				this.object = this.runtime.types_by_index[m[1]];
;
				this.get = this.get_object;
				this.block.addSolModifier(this.object);
				if (this.owner instanceof cr.action)
					this.block.setSolWriterAfterCnds();
				else if (this.block.parent)
					this.block.parent.setSolWriterAfterCnds();
				break;
			case 10:	// instvar
				this.index = m[1];
				if (owner.type.is_family)
					this.get = this.get_familyvar;
				else
					this.get = this.get_instvar;
				break;
			case 11:	// eventvar
				this.varname = m[1];
				this.eventvar = null;
				this.get = this.get_eventvar;
				break;
			case 2:		// audiofile	["name", ismusic]
			case 12:	// fileinfo		"name"
				this.fileinfo = m[1];
				this.get = this.get_audiofile;
				break;
			case 13:	// variadic
				this.get = this.get_variadic;
				this.subparams = [];
				this.variadicret = [];
				for (i = 1, len = m.length; i < len; i++)
				{
					param = new cr.parameter(this.owner, m[i]);
					cr.seal(param);
					this.subparams.push(param);
					this.variadicret.push(0);
				}
				break;
			default:
;
		}
	};
	Parameter.prototype.postInit = function ()
	{
		var i, len;
		if (this.type === 11)		// eventvar
		{
			this.eventvar = this.runtime.getEventVariableByName(this.varname, this.block.parent);
;
		}
		else if (this.type === 13)	// variadic, postInit all sub-params
		{
			for (i = 0, len = this.subparams.length; i < len; i++)
				this.subparams[i].postInit();
		}
		if (this.expression)
			this.expression.postInit();
	};
	Parameter.prototype.pushTempValue = function ()
	{
		tempValuesPtr++;
		if (tempValues.length === tempValuesPtr)
			tempValues.push(new cr.expvalue());
		return tempValues[tempValuesPtr];
	};
	Parameter.prototype.popTempValue = function ()
	{
		tempValuesPtr--;
	};
	Parameter.prototype.get_exp = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		return temp.data;      			// return actual JS value, not expvalue
	};
	Parameter.prototype.get_exp_str = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		if (cr.is_string(temp.data))
			return temp.data;
		else
			return "";
	};
	Parameter.prototype.get_object = function ()
	{
		return this.object;
	};
	Parameter.prototype.get_combosel = function ()
	{
		return this.combosel;
	};
	Parameter.prototype.get_layer = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		if (temp.is_number())
			return this.runtime.getLayerByNumber(temp.data);
		else
			return this.runtime.getLayerByName(temp.data);
	}
	Parameter.prototype.get_layout = function ()
	{
		return this.layout;
	};
	Parameter.prototype.get_key = function ()
	{
		return this.key;
	};
	Parameter.prototype.get_instvar = function ()
	{
		return this.index;
	};
	Parameter.prototype.get_familyvar = function (solindex)
	{
		var familytype = this.owner.type;
		var realtype = null;
		var sol = familytype.getCurrentSol();
		var objs = sol.getObjects();
		if (objs.length)
			realtype = objs[solindex % objs.length].type;
		else
		{
;
			realtype = sol.else_instances[solindex % sol.else_instances.length].type;
		}
		return this.index + realtype.family_var_map[familytype.family_index];
	};
	Parameter.prototype.get_eventvar = function ()
	{
		return this.eventvar;
	};
	Parameter.prototype.get_audiofile = function ()
	{
		return this.fileinfo;
	};
	Parameter.prototype.get_variadic = function ()
	{
		var i, len;
		for (i = 0, len = this.subparams.length; i < len; i++)
		{
			this.variadicret[i] = this.subparams[i].get();
		}
		return this.variadicret;
	};
	cr.parameter = Parameter;
	function EventVariable(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.name = m[1];
		this.vartype = m[2];
		this.initial = m[3];
		this.is_static = !!m[4];
		this.is_constant = !!m[5];
		this.data = this.initial;	// note: also stored in event stack frame for local nonstatic nonconst vars
		if (this.parent)			// local var
		{
			if (this.is_static || this.is_constant)
				this.localIndex = -1;
			else
				this.localIndex = this.runtime.stackLocalCount++;
		}
		else						// global var
		{
			this.localIndex = -1;
			this.runtime.all_global_vars.push(this);
		}
	};
	EventVariable.prototype.postInit = function ()
	{
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
	};
	EventVariable.prototype.setValue = function (x)
	{
;
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs)
			this.data = x;
		else	// local nonstatic variable: use event stack to keep value at this level of recursion
		{
			if (this.localIndex >= lvs.length)
				lvs.length = this.localIndex + 1;
			lvs[this.localIndex] = x;
		}
	};
	EventVariable.prototype.getValue = function ()
	{
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs)
			return this.data;
		else	// local nonstatic variable
		{
			if (this.localIndex >= lvs.length)
			{
;
				return this.initial;
			}
			if (typeof lvs[this.localIndex] === "undefined")
			{
;
				return this.initial;
			}
			return lvs[this.localIndex];
		}
	};
	EventVariable.prototype.run = function ()
	{
		if (this.parent && !this.is_static && !this.is_constant)
			this.setValue(this.initial);
	};
	cr.eventvariable = EventVariable;
	function EventInclude(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.include_sheet = null;		// determined in postInit
		this.include_sheet_name = m[1];
	};
	EventInclude.prototype.postInit = function ()
	{
        this.include_sheet = this.runtime.eventsheets[this.include_sheet_name];
;
;
        this.sheet.includes.add(this.include_sheet);
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
	};
	EventInclude.prototype.run = function ()
	{
		if (this.parent)
			this.runtime.pushCleanSol(this.runtime.types_by_index);
        if (!this.include_sheet.hasRun)
            this.include_sheet.run();
        if (this.parent)
            this.runtime.popSol(this.runtime.types_by_index);
	};
	cr.eventinclude = EventInclude;
	function EventStackFrame()
	{
		this.temp_parents_arr = [];
		this.reset(null);
		cr.seal(this);
	};
	EventStackFrame.prototype.reset = function (cur_event)
	{
		this.current_event = cur_event;
		this.cndindex = 0;
		this.actindex = 0;
		this.temp_parents_arr.length = 0;
		this.last_event_true = false;
		this.else_branch_ran = false;
	};
	EventStackFrame.prototype.isModifierAfterCnds = function ()
	{
		if (this.current_event.solWriterAfterCnds)
			return true;
		if (this.cndindex < this.current_event.conditions.length - 1)
			return !!this.current_event.solModifiers.length;
		return false;
	};
	cr.eventStackFrame = EventStackFrame;
}());
(function()
{
	function ExpNode(owner_, m)
	{
		this.owner = owner_;
		this.runtime = owner_.runtime;
		this.type = m[0];
;
		this.get = [this.eval_int,
					this.eval_float,
					this.eval_string,
					this.eval_unaryminus,
					this.eval_add,
					this.eval_subtract,
					this.eval_multiply,
					this.eval_divide,
					this.eval_mod,
					this.eval_power,
					this.eval_and,
					this.eval_or,
					this.eval_equal,
					this.eval_notequal,
					this.eval_less,
					this.eval_lessequal,
					this.eval_greater,
					this.eval_greaterequal,
					this.eval_conditional,
					this.eval_system_exp,
					this.eval_object_behavior_exp,
					this.eval_instvar_exp,
					this.eval_object_behavior_exp,
					this.eval_eventvar_exp][this.type];
		var paramsModel = null;
		this.value = null;
		this.first = null;
		this.second = null;
		this.third = null;
		this.func = null;
		this.results = null;
		this.parameters = null;
		this.object_type = null;
		this.beh_index = -1;
		this.instance_expr = null;
		this.varindex = -1;
		this.behavior_type = null;
		this.varname = null;
		this.eventvar = null;
		this.return_string = false;
		switch (this.type) {
		case 0:		// int
		case 1:		// float
		case 2:		// string
			this.value = m[1];
			break;
		case 3:		// unaryminus
			this.first = new cr.expNode(owner_, m[1]);
			break;
		case 18:	// conditional
			this.first = new cr.expNode(owner_, m[1]);
			this.second = new cr.expNode(owner_, m[2]);
			this.third = new cr.expNode(owner_, m[3]);
			break;
		case 19:	// system_exp
			this.func = m[1];
;
			this.results = [];
			this.parameters = [];
			if (m.length === 3)
			{
				paramsModel = m[2];
				this.results.length = paramsModel.length + 1;	// must also fit 'ret'
			}
			else
				this.results.length = 1;      // to fit 'ret'
			break;
		case 20:	// object_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.beh_index = -1;
			this.func = m[2];
			this.return_string = m[3];
			if (m[4])
				this.instance_expr = new cr.expNode(owner_, m[4]);
			else
				this.instance_expr = null;
			this.results = [];
			this.parameters = [];
			if (m.length === 6)
			{
				paramsModel = m[5];
				this.results.length = paramsModel.length + 1;
			}
			else
				this.results.length = 1;	// to fit 'ret'
			break;
		case 21:		// instvar_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.return_string = m[2];
			if (m[3])
				this.instance_expr = new cr.expNode(owner_, m[3]);
			else
				this.instance_expr = null;
			this.varindex = m[4];
			break;
		case 22:		// behavior_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.behavior_type = this.object_type.getBehaviorByName(m[2]);
;
			this.beh_index = this.object_type.getBehaviorIndexByName(m[2]);
			this.func = m[3];
			this.return_string = m[4];
			if (m[5])
				this.instance_expr = new cr.expNode(owner_, m[5]);
			else
				this.instance_expr = null;
			this.results = [];
			this.parameters = [];
			if (m.length === 7)
			{
				paramsModel = m[6];
				this.results.length = paramsModel.length + 1;
			}
			else
				this.results.length = 1;	// to fit 'ret'
			break;
		case 23:		// eventvar_exp
			this.varname = m[1];
			this.eventvar = null;	// assigned in postInit
			break;
		}
		if (this.type >= 4 && this.type <= 17)
		{
			this.first = new cr.expNode(owner_, m[1]);
			this.second = new cr.expNode(owner_, m[2]);
		}
		if (paramsModel)
		{
			var i, len;
			for (i = 0, len = paramsModel.length; i < len; i++)
				this.parameters.push(new cr.expNode(owner_, paramsModel[i]));
		}
		cr.seal(this);
	};
	ExpNode.prototype.postInit = function ()
	{
		if (this.type === 23)	// eventvar_exp
		{
			this.eventvar = this.owner.runtime.getEventVariableByName(this.varname, this.owner.block.parent);
;
		}
		if (this.first)
			this.first.postInit();
		if (this.second)
			this.second.postInit();
		if (this.third)
			this.third.postInit();
		if (this.instance_expr)
			this.instance_expr.postInit();
		if (this.parameters)
		{
			var i, len;
			for (i = 0, len = this.parameters.length; i < len; i++)
				this.parameters[i].postInit();
		}
	};
	ExpNode.prototype.eval_system_exp = function (ret)
	{
		this.results[0] = ret;
		var temp = this.owner.pushTempValue();
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
		{
			this.parameters[i].get(temp);
			this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
		}
		this.owner.popTempValue();
		this.func.apply(this.runtime.system, this.results);
	};
	ExpNode.prototype.eval_object_behavior_exp = function (ret)
	{
		var sol = this.object_type.getCurrentSol();
		var instances = sol.getObjects();
		if (!instances.length)
		{
			if (sol.else_instances.length)
				instances = sol.else_instances;
			else
			{
				if (this.return_string)
					ret.set_string("");
				else
					ret.set_int(0);
				return;
			}
		}
		this.results[0] = ret;
		ret.object_class = this.object_type;		// so expression can access family type if need be
		var temp = this.owner.pushTempValue();
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++) {
			this.parameters[i].get(temp);
			this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
		}
		var index = this.owner.solindex;
		if (this.instance_expr) {
			this.instance_expr.get(temp);
			if (temp.is_number()) {
				index = temp.data;
				instances = this.object_type.instances;    // pick from all instances, not SOL
			}
		}
		this.owner.popTempValue();
		index %= instances.length;      // wraparound
		if (index < 0)
			index += instances.length;
		var returned_val;
		var inst = instances[index];
		if (this.beh_index > -1)
		{
			var offset = 0;
			if (this.object_type.is_family)
			{
				offset = inst.type.family_beh_map[this.object_type.family_index];
			}
			returned_val = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
		}
		else
			returned_val = this.func.apply(inst, this.results);
;
	};
	ExpNode.prototype.eval_instvar_exp = function (ret)
	{
		var sol = this.object_type.getCurrentSol();
		var instances = sol.getObjects();
		if (!instances.length)
		{
			if (sol.else_instances.length)
				instances = sol.else_instances;
			else
			{
				if (this.return_string)
					ret.set_string("");
				else
					ret.set_int(0);
				return;
			}
		}
		var index = this.owner.solindex;
		if (this.instance_expr)
		{
			var temp = this.owner.pushTempValue();
			this.instance_expr.get(temp);
			if (temp.is_number())
			{
				index = temp.data;
				var type_instances = this.object_type.instances;
				index %= type_instances.length;     // wraparound
				if (index < 0)                      // offset
					index += type_instances.length;
				var to_ret = type_instances[index].instance_vars[this.varindex];
				if (cr.is_string(to_ret))
					ret.set_string(to_ret);
				else
					ret.set_float(to_ret);
				this.owner.popTempValue();
				return;         // done
			}
			this.owner.popTempValue();
		}
		index %= instances.length;      // wraparound
		if (index < 0)
			index += instances.length;
		var inst = instances[index];
		var offset = 0;
		if (this.object_type.is_family)
		{
			offset = inst.type.family_var_map[this.object_type.family_index];
		}
		var to_ret = inst.instance_vars[this.varindex + offset];
		if (cr.is_string(to_ret))
			ret.set_string(to_ret);
		else
			ret.set_float(to_ret);
	};
	ExpNode.prototype.eval_int = function (ret)
	{
		ret.type = cr.exptype.Integer;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_float = function (ret)
	{
		ret.type = cr.exptype.Float;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_string = function (ret)
	{
		ret.type = cr.exptype.String;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_unaryminus = function (ret)
	{
		this.first.get(ret);                // retrieve operand
		if (ret.is_number())
			ret.data = -ret.data;
	};
	ExpNode.prototype.eval_add = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data += temp.data;          // both operands numbers: add
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_subtract = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data -= temp.data;          // both operands numbers: subtract
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_multiply = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data *= temp.data;          // both operands numbers: multiply
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_divide = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data /= temp.data;          // both operands numbers: divide
			ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_mod = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data %= temp.data;          // both operands numbers: modulo
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_power = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data = Math.pow(ret.data, temp.data);   // both operands numbers: raise to power
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_and = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number())
		{
			if (temp.is_string())
			{
				ret.set_string(ret.data.toString() + temp.data);
			}
			else
			{
				if (ret.data && temp.data)
					ret.set_int(1);
				else
					ret.set_int(0);
			}
		}
		else if (ret.is_string())
		{
			if (temp.is_string())
				ret.data += temp.data;
			else
			{
				ret.data += (Math.round(temp.data * 1e10) / 1e10).toString();
			}
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_or = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			if (ret.data || temp.data)
				ret.set_int(1);
			else
				ret.set_int(0);
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_conditional = function (ret)
	{
		this.first.get(ret);                // condition operand
		if (ret.data)                       // is true
			this.second.get(ret);           // evaluate second operand to ret
		else
			this.third.get(ret);            // evaluate third operand to ret
	};
	ExpNode.prototype.eval_equal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data === temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_notequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data !== temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_less = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data < temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_lessequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data <= temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_greater = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data > temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_greaterequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data >= temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_eventvar_exp = function (ret)
	{
		var val = this.eventvar.getValue();
		if (cr.is_number(val))
			ret.set_float(val);
		else
			ret.set_string(val);
	};
	cr.expNode = ExpNode;
	function ExpValue(type, data)
	{
		this.type = type || cr.exptype.Integer;
		this.data = data || 0;
		this.object_class = null;
;
;
;
		if (this.type == cr.exptype.Integer)
			this.data = Math.floor(this.data);
		cr.seal(this);
	};
	ExpValue.prototype.is_int = function ()
	{
		return this.type === cr.exptype.Integer;
	};
	ExpValue.prototype.is_float = function ()
	{
		return this.type === cr.exptype.Float;
	};
	ExpValue.prototype.is_number = function ()
	{
		return this.type === cr.exptype.Integer || this.type === cr.exptype.Float;
	};
	ExpValue.prototype.is_string = function ()
	{
		return this.type === cr.exptype.String;
	};
	ExpValue.prototype.make_int = function ()
	{
		if (!this.is_int())
		{
			if (this.is_float())
				this.data = Math.floor(this.data);      // truncate float
			else if (this.is_string())
				this.data = parseInt(this.data, 10);
			this.type = cr.exptype.Integer;
		}
	};
	ExpValue.prototype.make_float = function ()
	{
		if (!this.is_float())
		{
			if (this.is_string())
				this.data = parseFloat(this.data);
			this.type = cr.exptype.Float;
		}
	};
	ExpValue.prototype.make_string = function ()
	{
		if (!this.is_string())
		{
			this.data = this.data.toString();
			this.type = cr.exptype.String;
		}
	};
	ExpValue.prototype.set_int = function (val)
	{
;
		this.type = cr.exptype.Integer;
		this.data = Math.floor(val);
	};
	ExpValue.prototype.set_float = function (val)
	{
;
		this.type = cr.exptype.Float;
		this.data = val;
	};
	ExpValue.prototype.set_string = function (val)
	{
;
		this.type = cr.exptype.String;
		this.data = val;
	};
	ExpValue.prototype.set_any = function (val)
	{
		if (cr.is_number(val))
		{
			this.type = cr.exptype.Float;
			this.data = val;
		}
		else if (cr.is_string(val))
		{
			this.type = cr.exptype.String;
			this.data = val.toString();
		}
		else
		{
			this.type = cr.exptype.Integer;
			this.data = 0;
		}
	};
	cr.expvalue = ExpValue;
	cr.exptype = {
		Integer: 0,     // emulated; no native integer support in javascript
		Float: 1,
		String: 2
	};
}());
;
cr.system_object = function (runtime)
{
    this.runtime = runtime;
	this.waits = [];
};
(function ()
{
	var sysProto = cr.system_object.prototype;
	function SysCnds() {};
    SysCnds.prototype.EveryTick = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutStart = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutEnd = function()
    {
        return true;
    };
    SysCnds.prototype.Compare = function(x, cmp, y)
    {
        return cr.do_cmp(x, cmp, y);
    };
    SysCnds.prototype.CompareTime = function (cmp, t)
    {
        var elapsed = this.runtime.kahanTime.sum;
        if (cmp === 0)
        {
            var cnd = this.runtime.getCurrentCondition();
            if (!cnd.extra.CompareTime_executed)
            {
                if (elapsed >= t)
                {
                    cnd.extra.CompareTime_executed = true;
                    return true;
                }
            }
            return false;
        }
        return cr.do_cmp(elapsed, cmp, t);
    };
    SysCnds.prototype.LayerVisible = function (layer)
    {
        if (!layer)
            return false;
        else
            return layer.visible;
    };
	SysCnds.prototype.LayerCmpOpacity = function (layer, cmp, opacity_)
	{
		if (!layer)
			return false;
		return cr.do_cmp(layer.opacity * 100, cmp, opacity_);
	};
    SysCnds.prototype.Repeat = function (count)
    {
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
		if (solModifierAfterCnds)
		{
			for (i = 0; i < count && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			for (i = 0; i < count && !current_loop.stopped; i++)
			{
				current_loop.index = i;
				current_event.retrigger();
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
	SysCnds.prototype.While = function (count)
    {
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
		if (solModifierAfterCnds)
		{
			for (i = 0; !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				if (!current_event.retrigger())		// one of the other conditions returned false
					current_loop.stopped = true;	// break
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			for (i = 0; !current_loop.stopped; i++)
			{
				current_loop.index = i;
				if (!current_event.retrigger())
					current_loop.stopped = true;
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
    SysCnds.prototype.For = function (name, start, end)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack(name);
        var i;
		if (solModifierAfterCnds)
		{
			for (i = start; i <= end && !current_loop.stopped; i++)  // inclusive to end
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			for (i = start; i <= end && !current_loop.stopped; i++)  // inclusive to end
			{
				current_loop.index = i;
				current_event.retrigger();
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
	var foreach_instancestack = [];
	var foreach_instanceptr = -1;
    SysCnds.prototype.ForEach = function (obj)
    {
        var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i, len, j, lenj, inst, s, sol2;
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds)
		{
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			sol.select_all = false;
			sol.instances.length = 1;
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
			}
		}
        this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false;
    };
	function foreach_sortinstances(a, b)
	{
		var va = a.extra.c2_foreachordered_val;
		var vb = b.extra.c2_foreachordered_val;
		if (cr.is_number(va) && cr.is_number(vb))
			return va - vb;
		else
		{
			va = "" + va;
			vb = "" + vb;
			if (va < vb)
				return -1;
			else if (va > vb)
				return 1;
			else
				return 0;
		}
	};
	SysCnds.prototype.ForEachOrdered = function (obj, exp, order)
    {
        var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var current_condition = this.runtime.getCurrentCondition();
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
		var i, len, j, lenj, inst, s, sol2;
		for (i = 0, len = instances.length; i < len; i++)
		{
			instances[i].extra.c2_foreachordered_val = current_condition.parameters[1].get(i);
		}
		instances.sort(foreach_sortinstances);
		if (order === 1)
			instances.reverse();
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds)
		{
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			sol.select_all = false;
			sol.instances.length = 1;
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
			}
		}
        this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false;
    };
    SysCnds.prototype.TriggerOnce = function ()
    {
        var cndextra = this.runtime.getCurrentCondition().extra;
		if (typeof cndextra.TriggerOnce_lastTick === "undefined")
			cndextra.TriggerOnce_lastTick = -1;
        var last_tick = cndextra.TriggerOnce_lastTick;
        var cur_tick = this.runtime.tickcount;
        cndextra.TriggerOnce_lastTick = cur_tick;
        return this.runtime.layout_first_tick || last_tick !== cur_tick - 1;
    };
    SysCnds.prototype.Every = function (seconds)
    {
        var cnd = this.runtime.getCurrentCondition();
        var last_time = cnd.extra.Every_lastTime || 0;
        var cur_time = this.runtime.kahanTime.sum;
        if (cur_time >= last_time + seconds)
        {
            cnd.extra.Every_lastTime = last_time + seconds;
			if (cur_time >= cnd.extra.Every_lastTime + seconds)
				cnd.extra.Every_lastTime = cur_time;
            return true;
        }
        else
            return false;
    };
    SysCnds.prototype.PickNth = function (obj, index)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
		index = cr.floor(index);
        if (index < 0 || index >= instances.length)
            return false;
		var inst = instances[index];
        sol.pick_one(inst);
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.PickRandom = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
		var index = cr.floor(Math.random() * instances.length);
        if (index >= instances.length)
            return false;
		var inst = instances[index];
        sol.pick_one(inst);
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.CompareVar = function (v, cmp, val)
    {
        return cr.do_cmp(v.getValue(), cmp, val);
    };
    SysCnds.prototype.IsGroupActive = function (group)
    {
        return this.runtime.activeGroups[(/*this.runtime.getCurrentCondition().sheet.name + "|" + */group).toLowerCase()];
    };
	SysCnds.prototype.IsPreview = function ()
	{
		return typeof cr_is_preview !== "undefined";
	};
	SysCnds.prototype.PickAll = function (obj)
    {
        if (!obj)
            return false;
		if (!obj.instances.length)
			return false;
        var sol = obj.getCurrentSol();
        sol.select_all = true;
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.IsMobile = function ()
	{
		return this.runtime.isMobile;
	};
	SysCnds.prototype.CompareBetween = function (x, a, b)
	{
		return x >= a && x <= b;
	};
	SysCnds.prototype.Else = function ()
	{
		var current_frame = this.runtime.getCurrentEventStack();
		if (current_frame.else_branch_ran)
			return false;		// another event in this else-if chain has run
		else
			return !current_frame.last_event_true;
		/*
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var prev_event = current_event.prev_block;
		if (!prev_event)
			return false;
		if (prev_event.is_logical)
			return !this.runtime.last_event_true;
		var i, len, j, lenj, s, sol, temp, inst, any_picked = false;
		for (i = 0, len = prev_event.cndReferences.length; i < len; i++)
		{
			s = prev_event.cndReferences[i];
			sol = s.getCurrentSol();
			if (sol.select_all || sol.instances.length === s.instances.length)
			{
				sol.select_all = false;
				sol.instances.length = 0;
			}
			else
			{
				if (sol.instances.length === 1 && sol.else_instances.length === 0 && s.instances.length >= 2)
				{
					inst = sol.instances[0];
					sol.instances.length = 0;
					for (j = 0, lenj = s.instances.length; j < lenj; j++)
					{
						if (s.instances[j] != inst)
							sol.instances.push(s.instances[j]);
					}
					any_picked = true;
				}
				else
				{
					temp = sol.instances;
					sol.instances = sol.else_instances;
					sol.else_instances = temp;
					any_picked = true;
				}
			}
		}
		return any_picked;
		*/
	};
	SysCnds.prototype.OnLoadFinished = function ()
	{
		return true;
	};
	SysCnds.prototype.OnCanvasSnapshot = function ()
	{
		return true;
	};
	SysCnds.prototype.EffectsSupported = function ()
	{
		return !!this.runtime.glwrap;
	};
	sysProto.cnds = new SysCnds();
    function SysActs() {};
    SysActs.prototype.GoToLayout = function(to)
    {
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
;
        this.runtime.changelayout = to;
    };
    SysActs.prototype.CreateObject = function (obj, layer, x, y)
    {
        if (!layer || !obj)
            return;
        var inst = this.runtime.createInstance(obj, layer, x, y);
		if (!inst)
			return;
		this.runtime.isInOnDestroy++;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		this.runtime.isInOnDestroy--;
        var sol = obj.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;
		var i, len, s;
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = s;
			}
		}
    };
    SysActs.prototype.SetLayerVisible = function (layer, visible_)
    {
        if (!layer)
            return;
		if (layer.visible !== visible_)
		{
			layer.visible = visible_;
			this.runtime.redraw = true;
		}
    };
	SysActs.prototype.SetLayerOpacity = function (layer, opacity_)
	{
		if (!layer)
			return;
		opacity_ = cr.clamp(opacity_ / 100, 0, 1);
		if (layer.opacity !== opacity_)
		{
			layer.opacity = opacity_;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayerScaleRate = function (layer, sr)
	{
		if (!layer)
			return;
		if (layer.zoomRate !== sr)
		{
			layer.zoomRate = sr;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayoutScale = function (s)
	{
		if (!this.runtime.running_layout)
			return;
		if (this.runtime.running_layout.scale !== s)
		{
			this.runtime.running_layout.scale = s;
			this.runtime.redraw = true;
		}
	};
    SysActs.prototype.ScrollX = function(x)
    {
        this.runtime.running_layout.scrollToX(x);
    };
    SysActs.prototype.ScrollY = function(y)
    {
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.Scroll = function(x, y)
    {
        this.runtime.running_layout.scrollToX(x);
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.ScrollToObject = function(obj)
    {
        var inst = obj.getFirstPicked();
        if (inst)
        {
            this.runtime.running_layout.scrollToX(inst.x);
            this.runtime.running_layout.scrollToY(inst.y);
        }
    };
	SysActs.prototype.SetVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(x);
			else
				v.setValue(parseFloat(x));
		}
		else if (v.vartype === 1)
			v.setValue(x.toString());
	};
	SysActs.prototype.AddVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(v.getValue() + x);
			else
				v.setValue(v.getValue() + parseFloat(x));
		}
		else if (v.vartype === 1)
			v.setValue(v.getValue() + x.toString());
	};
	SysActs.prototype.SubVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(v.getValue() - x);
			else
				v.setValue(v.getValue() - parseFloat(x));
		}
	};
    SysActs.prototype.SetGroupActive = function (group, active)
    {
		var activeGroups = this.runtime.activeGroups;
		var groupkey = (/*this.runtime.getCurrentAction().sheet.name + "|" + */group).toLowerCase();
		switch (active) {
		case 0:
			activeGroups[groupkey] = false;
			break;
		case 1:
			activeGroups[groupkey] = true;
			break;
		case 2:
			activeGroups[groupkey] = !activeGroups[groupkey];
			break;
		}
    };
    SysActs.prototype.SetTimescale = function (ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        this.runtime.timescale = ts;
    };
    SysActs.prototype.SetObjectTimescale = function (obj, ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        if (!obj)
            return;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = ts;
        }
    };
    SysActs.prototype.RestoreObjectTimescale = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = -1.0;
        }
    };
	SysActs.prototype.Wait = function (seconds)
	{
		if (seconds < 0)
			return;
		var i, len, s, t;
		var evinfo = this.runtime.getCurrentEventStack();
		var waitobj = {};
		waitobj.time = this.runtime.kahanTime.sum + seconds;
		waitobj.ev = evinfo.current_event;
		waitobj.actindex = evinfo.actindex + 1;	// pointing at next action
		waitobj.deleteme = false;
		waitobj.sols = {};
		waitobj.solModifiers = [];
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
		{
			t = this.runtime.types_by_index[i];
			s = t.getCurrentSol();
			if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1)
				continue;
			waitobj.solModifiers.push(t);
			waitobj.sols[i.toString()] = s.instances.slice(0);
		}
		this.waits.push(waitobj);
		return true;
	};
	SysActs.prototype.SetLayerScale = function (layer, scale)
    {
        if (!layer)
            return;
		if (layer.scale === scale)
			return;
        layer.scale = scale;
        this.runtime.redraw = true;
    };
	SysActs.prototype.ResetGlobals = function ()
	{
		var i, len, g;
		for (i = 0, len = this.runtime.all_global_vars.length; i < len; i++)
		{
			g = this.runtime.all_global_vars[i];
			g.data = g.initial;
		}
	};
	SysActs.prototype.SetLayoutAngle = function (a)
	{
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (this.runtime.running_layout)
		{
			if (this.runtime.running_layout.angle !== a)
			{
				this.runtime.running_layout.angle = a;
				this.runtime.redraw = true;
			}
		}
	};
	SysActs.prototype.SetLayerAngle = function (layer, a)
    {
        if (!layer)
            return;
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (layer.angle === a)
			return;
        layer.angle = a;
        this.runtime.redraw = true;
    };
	SysActs.prototype.StopLoop = function ()
	{
		if (this.runtime.loop_stack_index < 0)
			return;		// no loop currently running
		this.runtime.getCurrentLoop().stopped = true;
	};
	SysActs.prototype.GoToLayoutByName = function (layoutname)
	{
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to different layout
;
		var l;
		for (l in this.runtime.layouts)
		{
			if (this.runtime.layouts.hasOwnProperty(l) && l.toLowerCase() === layoutname.toLowerCase())
			{
				this.runtime.changelayout = this.runtime.layouts[l];
				return;
			}
		}
	};
	SysActs.prototype.RestartLayout = function (layoutname)
	{
		if (this.runtime.isloading)
			return;		// cannot restart loader layouts
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
;
		if (!this.runtime.running_layout)
			return;
		this.runtime.changelayout = this.runtime.running_layout;
		var i, len, g;
		for (i = 0, len = this.runtime.allGroups.length; i < len; i++)
		{
			g = this.runtime.allGroups[i];
			this.runtime.activeGroups[g.group_name.toLowerCase()] = g.initially_activated;
		}
	};
	SysActs.prototype.SnapshotCanvas = function (format_, quality_)
	{
		this.runtime.snapshotCanvas = [format_ === 0 ? "image/png" : "image/jpeg", quality_ / 100];
		this.runtime.redraw = true;		// force redraw so snapshot is always taken
	};
	SysActs.prototype.SetCanvasSize = function (w, h)
	{
		if (w <= 0 || h <= 0)
			return;
		this.runtime["setSize"](w, h);
	};
	SysActs.prototype.SetLayoutEffectEnabled = function (enable_, effectname_)
	{
		if (!this.runtime.running_layout || !this.runtime.glwrap)
			return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var enable = (enable_ === 1);
		if (et.active == enable)
			return;		// no change
		et.active = enable;
		this.runtime.running_layout.updateActiveEffects();
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerEffectEnabled = function (layer, enable_, effectname_)
	{
		if (!layer || !this.runtime.glwrap)
			return;
		var et = layer.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var enable = (enable_ === 1);
		if (et.active == enable)
			return;		// no change
		et.active = enable;
		layer.updateActiveEffects();
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayoutEffectParam = function (effectname_, index_, value_)
	{
		if (!this.runtime.running_layout || !this.runtime.glwrap)
			return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var params = this.runtime.running_layout.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length)
			return;		// effect index out of bounds
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
			value_ /= 100.0;
		if (params[index_] === value_)
			return;		// no change
		params[index_] = value_;
		if (et.active)
			this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerEffectParam = function (layer, effectname_, index_, value_)
	{
		if (!layer || !this.runtime.glwrap)
			return;
		var et = layer.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var params = layer.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length)
			return;		// effect index out of bounds
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
			value_ /= 100.0;
		if (params[index_] === value_)
			return;		// no change
		params[index_] = value_;
		if (et.active)
			this.runtime.redraw = true;
	};
	sysProto.acts = new SysActs();
    function SysExps() {};
    SysExps.prototype["int"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_int(parseInt(x, 10));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_int(x);
    };
    SysExps.prototype["float"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_float(parseFloat(x));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_float(x);
    };
    SysExps.prototype.str = function(ret, x)
    {
        if (cr.is_string(x))
            ret.set_string(x);
        else
            ret.set_string(x.toString());
    };
    SysExps.prototype.len = function(ret, x)
    {
        ret.set_int(x.length || 0);
    };
    SysExps.prototype.random = function (ret, a, b)
    {
        if (b === undefined)
        {
            ret.set_float(Math.random() * a);
        }
        else
        {
            ret.set_float(Math.random() * (b - a) + a);
        }
    };
    SysExps.prototype.sqrt = function(ret, x)
    {
        ret.set_float(Math.sqrt(x));
    };
    SysExps.prototype.abs = function(ret, x)
    {
        ret.set_float(Math.abs(x));
    };
    SysExps.prototype.round = function(ret, x)
    {
        ret.set_int(Math.round(x));
    };
    SysExps.prototype.floor = function(ret, x)
    {
        ret.set_int(Math.floor(x));
    };
    SysExps.prototype.ceil = function(ret, x)
    {
        ret.set_int(Math.ceil(x));
    };
    SysExps.prototype.sin = function(ret, x)
    {
        ret.set_float(Math.sin(cr.to_radians(x)));
    };
    SysExps.prototype.cos = function(ret, x)
    {
        ret.set_float(Math.cos(cr.to_radians(x)));
    };
    SysExps.prototype.tan = function(ret, x)
    {
        ret.set_float(Math.tan(cr.to_radians(x)));
    };
    SysExps.prototype.asin = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.asin(x)));
    };
    SysExps.prototype.acos = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.acos(x)));
    };
    SysExps.prototype.atan = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.atan(x)));
    };
    SysExps.prototype.exp = function(ret, x)
    {
        ret.set_float(Math.exp(x));
    };
    SysExps.prototype.ln = function(ret, x)
    {
        ret.set_float(Math.log(x));
    };
    SysExps.prototype.log10 = function(ret, x)
    {
        ret.set_float(Math.log(x) / Math.LN10);
    };
    SysExps.prototype.max = function(ret)
    {
		var max_ = arguments[1];
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
		{
			if (max_ < arguments[i])
				max_ = arguments[i];
		}
		ret.set_float(max_);
    };
    SysExps.prototype.min = function(ret)
    {
        var min_ = arguments[1];
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
		{
			if (min_ > arguments[i])
				min_ = arguments[i];
		}
		ret.set_float(min_);
    };
    SysExps.prototype.dt = function(ret)
    {
        ret.set_float(this.runtime.dt);
    };
    SysExps.prototype.timescale = function(ret)
    {
        ret.set_float(this.runtime.timescale);
    };
    SysExps.prototype.wallclocktime = function(ret)
    {
        ret.set_float((Date.now() - this.runtime.start_time) / 1000.0);
    };
    SysExps.prototype.time = function(ret)
    {
        ret.set_float(this.runtime.kahanTime.sum);
    };
    SysExps.prototype.tickcount = function(ret)
    {
        ret.set_int(this.runtime.tickcount);
    };
    SysExps.prototype.objectcount = function(ret)
    {
        ret.set_int(this.runtime.objectcount);
    };
    SysExps.prototype.fps = function(ret)
    {
        ret.set_int(this.runtime.fps);
    };
    SysExps.prototype.loopindex = function(ret, name_)
    {
        if (!this.runtime.loop_stack.length)
        {
            ret.set_int(0);
            return;
        }
        if (name_)
        {
            var i, len;
            for (i = 0, len = this.runtime.loop_stack.length; i < len; i++)
            {
                var loop = this.runtime.loop_stack[i];
                if (loop.name === name_)
                {
                    ret.set_int(loop.index);
                    return;
                }
            }
            ret.set_int(0);
        }
        else
        {
            ret.set_int(this.runtime.getCurrentLoop().index);
        }
    };
    SysExps.prototype.distance = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.distanceTo(x1, y1, x2, y2));
    };
    SysExps.prototype.angle = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.to_degrees(cr.angleTo(x1, y1, x2, y2)));
    };
    SysExps.prototype.scrollx = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollX);
    };
    SysExps.prototype.scrolly = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollY);
    };
    SysExps.prototype.newline = function(ret)
    {
        ret.set_string("\n");
    };
    SysExps.prototype.lerp = function(ret, a, b, x)
    {
        ret.set_float(cr.lerp(a, b, x));
    };
    SysExps.prototype.windowwidth = function(ret)
    {
        ret.set_int(this.runtime.width);
    };
    SysExps.prototype.windowheight = function(ret)
    {
        ret.set_int(this.runtime.height);
    };
	SysExps.prototype.uppercase = function(ret, str)
	{
		ret.set_string(cr.is_string(str) ? str.toUpperCase() : "");
	};
	SysExps.prototype.lowercase = function(ret, str)
	{
		ret.set_string(cr.is_string(str) ? str.toLowerCase() : "");
	};
	SysExps.prototype.clamp = function(ret, x, l, u)
	{
		if (x < l)
			ret.set_float(l);
		else if (x > u)
			ret.set_float(u);
		else
			ret.set_float(x);
	};
	SysExps.prototype.layerscale = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.scale);
	};
	SysExps.prototype.layeropacity = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.opacity * 100);
	};
	SysExps.prototype.layerscalerate = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.zoomRate);
	};
	SysExps.prototype.layoutscale = function (ret)
	{
		if (this.runtime.running_layout)
			ret.set_float(this.runtime.running_layout.scale);
		else
			ret.set_float(0);
	};
	SysExps.prototype.layoutangle = function (ret)
	{
		ret.set_float(cr.to_degrees(this.runtime.running_layout.angle));
	};
	SysExps.prototype.layerangle = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(cr.to_degrees(layer.angle));
	};
	SysExps.prototype.layoutwidth = function (ret)
	{
		ret.set_int(this.runtime.running_layout.width);
	};
	SysExps.prototype.layoutheight = function (ret)
	{
		ret.set_int(this.runtime.running_layout.height);
	};
	SysExps.prototype.find = function (ret, text, searchstr)
	{
		if (cr.is_string(text) && cr.is_string(searchstr))
			ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr), "i")));
		else
			ret.set_int(-1);
	};
	SysExps.prototype.left = function (ret, text, n)
	{
		ret.set_string(cr.is_string(text) ? text.substr(0, n) : "");
	};
	SysExps.prototype.right = function (ret, text, n)
	{
		ret.set_string(cr.is_string(text) ? text.substr(text.length - n) : "");
	};
	SysExps.prototype.mid = function (ret, text, index_, length_)
	{
		ret.set_string(cr.is_string(text) ? text.substr(index_, length_) : "");
	};
	SysExps.prototype.tokenat = function (ret, text, index_, sep)
	{
		if (cr.is_string(text) && cr.is_string(sep))
		{
			var arr = text.split(sep);
			var i = cr.floor(index_);
			if (i < 0 || i >= arr.length)
				ret.set_string("");
			else
				ret.set_string(arr[i]);
		}
		else
			ret.set_string("");
	};
	SysExps.prototype.tokencount = function (ret, text, sep)
	{
		if (cr.is_string(text) && text.length)
			ret.set_int(text.split(sep).length);
		else
			ret.set_int(0);
	};
	SysExps.prototype.replace = function (ret, text, find_, replace_)
	{
		if (cr.is_string(text) && cr.is_string(find_) && cr.is_string(replace_))
			ret.set_string(text.replace(new RegExp(cr.regexp_escape(find_), "gi"), replace_));
		else
			ret.set_string(cr.is_string(text) ? text : "");
	};
	SysExps.prototype.trim = function (ret, text)
	{
		ret.set_string(cr.is_string(text) ? text.trim() : "");
	};
	SysExps.prototype.pi = function (ret)
	{
		ret.set_float(cr.PI);
	};
	SysExps.prototype.layoutname = function (ret)
	{
		if (this.runtime.running_layout)
			ret.set_string(this.runtime.running_layout.name);
		else
			ret.set_string("");
	};
	SysExps.prototype.renderer = function (ret)
	{
		ret.set_string(this.runtime.gl ? "webgl" : "canvas2d");
	};
	SysExps.prototype.anglediff = function (ret, a, b)
	{
		ret.set_float(cr.to_degrees(cr.angleDiff(cr.to_radians(a), cr.to_radians(b))));
	};
	SysExps.prototype.choose = function (ret)
	{
		var index = cr.floor(Math.random() * (arguments.length - 1));
		ret.set_any(arguments[index + 1]);
	};
	SysExps.prototype.rgb = function (ret, r, g, b)
	{
		ret.set_int(cr.RGB(r, g, b));
	};
	SysExps.prototype.projectversion = function (ret)
	{
		ret.set_string(this.runtime.versionstr);
	};
	SysExps.prototype.anglelerp = function (ret, a, b, x)
	{
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		var diff = cr.angleDiff(a, b);
		if (cr.angleClockwise(b, a))
		{
			ret.set_float(cr.to_clamped_degrees(a + diff * x));
		}
		else
		{
			ret.set_float(cr.to_clamped_degrees(a - diff * x));
		}
	};
	SysExps.prototype.anglerotate = function (ret, a, b, c)
	{
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		c = cr.to_radians(c);
		ret.set_float(cr.to_clamped_degrees(cr.angleRotate(a, b, c)));
	};
	SysExps.prototype.zeropad = function (ret, n, d)
	{
		var s = (n < 0 ? "-" : "");
		if (n < 0) n = -n;
		var zeroes = d - n.toString().length;
		for (var i = 0; i < zeroes; i++)
			s += "0";
		ret.set_string(s + n.toString());
	};
	SysExps.prototype.cpuutilisation = function (ret)
	{
		ret.set_float(this.runtime.cpuutilisation / 1000);
	};
	SysExps.prototype.viewportleft = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewLeft : 0);
	};
	SysExps.prototype.viewporttop = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewTop : 0);
	};
	SysExps.prototype.viewportright = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewRight : 0);
	};
	SysExps.prototype.viewportbottom = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewBottom : 0);
	};
	SysExps.prototype.loadingprogress = function (ret)
	{
		ret.set_float(this.runtime.loadingprogress);
	};
	SysExps.prototype.unlerp = function(ret, a, b, y)
    {
        ret.set_float((y - a) / (b - a));
    };
	SysExps.prototype.canvassnapshot = function (ret)
	{
		ret.set_string(this.runtime.snapshotData);
	};
	SysExps.prototype.urlencode = function (ret, s)
	{
		ret.set_string(encodeURIComponent(s));
	};
	SysExps.prototype.urldecode = function (ret, s)
	{
		ret.set_string(decodeURIComponent(s));
	};
	SysExps.prototype.canvastolayerx = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, true) : 0);
	};
	SysExps.prototype.canvastolayery = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, false) : 0);
	};
	SysExps.prototype.layertocanvasx = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, true) : 0);
	};
	SysExps.prototype.layertocanvasy = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, false) : 0);
	};
	sysProto.exps = new SysExps();
	sysProto.runWaits = function ()
	{
		var i, j, len, w, k, s;
		var evinfo = this.runtime.getCurrentEventStack();
		for (i = 0, len = this.waits.length; i < len; i++)
		{
			w = this.waits[i];
			if (w.time > this.runtime.kahanTime.sum)
				continue;
			evinfo.current_event = w.ev;
			evinfo.actindex = w.actindex;
			evinfo.cndindex = 0;
			for (k in w.sols)
			{
				if (w.sols.hasOwnProperty(k))
				{
					s = this.runtime.types_by_index[parseInt(k, 10)].getCurrentSol();
					s.select_all = false;
					s.instances = w.sols[k];
				}
			}
			w.ev.resume_actions_and_subevents();
			this.runtime.clearSol(w.solModifiers);
			w.deleteme = true;
		}
		for (i = 0, j = 0, len = this.waits.length; i < len; i++)
		{
			w = this.waits[i];
			this.waits[j] = w;
			if (!w.deleteme)
				j++;
		}
		this.waits.length = j;
	};
}());
;
cr.add_common_aces = function (m)
{
	var pluginProto = m[0].prototype;
	var singleglobal_ = m[1];
	var position_aces = m[3];
	var size_aces = m[4];
	var angle_aces = m[5];
	var appearance_aces = m[6];
	var zorder_aces = m[7];
	var effects_aces = m[8];
    if (!pluginProto.cnds)
        pluginProto.cnds = {};
    if (!pluginProto.acts)
        pluginProto.acts = {};
    if (!pluginProto.exps)
        pluginProto.exps = {};
    var cnds = pluginProto.cnds;
    var acts = pluginProto.acts;
    var exps = pluginProto.exps;
    if (position_aces)
    {
        cnds.CompareX = function (cmp, x)
        {
            return cr.do_cmp(this.x, cmp, x);
        };
        cnds.CompareY = function (cmp, y)
        {
            return cr.do_cmp(this.y, cmp, y);
        };
        cnds.IsOnScreen = function ()
        {
			var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;
            return !(bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom);
        };
        cnds.IsOutsideLayout = function ()
        {
            this.update_bbox();
            var bbox = this.bbox;
            var layout = this.runtime.running_layout;
            return (bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height);
        };
		cnds.PickDistance = function (which, x, y)
		{
			var sol = this.getCurrentSol();
			var instances = sol.getObjects();
			if (!instances.length)
				return false;
			var inst = instances[0];
			var pickme = inst;
			var dist = cr.distanceTo(inst.x, inst.y, x, y);
			var i, len, d;
			for (i = 1, len = instances.length; i < len; i++)
			{
				inst = instances[i];
				d = cr.distanceTo(inst.x, inst.y, x, y);
				if ((which === 0 && d < dist) || (which === 1 && d > dist))
				{
					dist = d;
					pickme = inst;
				}
			}
			sol.pick_one(pickme);
			return true;
		};
        acts.SetX = function (x)
        {
            if (this.x !== x)
            {
                this.x = x;
                this.set_bbox_changed();
            }
        };
        acts.SetY = function (y)
        {
            if (this.y !== y)
            {
                this.y = y;
                this.set_bbox_changed();
            }
        };
        acts.SetPos = function (x, y)
        {
            if (this.x !== x || this.y !== y)
            {
                this.x = x;
                this.y = y;
                this.set_bbox_changed();
            }
        };
        acts.SetPosToObject = function (obj, imgpt)
        {
            var inst = obj.getPairedInstance(this);
            if (!inst)
				return;
			var newx, newy;
			if (inst.getImagePoint)
			{
				newx = inst.getImagePoint(imgpt, true);
				newy = inst.getImagePoint(imgpt, false);
			}
			else
			{
				newx = inst.x;
				newy = inst.y;
			}
			if (this.x !== newx || this.y !== newy)
            {
				this.x = newx;
				this.y = newy;
				this.set_bbox_changed();
            }
        };
        acts.MoveForward = function (dist)
        {
            if (dist !== 0)
            {
                this.x += Math.cos(this.angle) * dist;
                this.y += Math.sin(this.angle) * dist;
                this.set_bbox_changed();
            }
        };
        acts.MoveAtAngle = function (a, dist)
        {
            if (dist !== 0)
            {
                this.x += Math.cos(cr.to_radians(a)) * dist;
                this.y += Math.sin(cr.to_radians(a)) * dist;
                this.set_bbox_changed();
            }
        };
        exps.X = function (ret)
        {
            ret.set_float(this.x);
        };
        exps.Y = function (ret)
        {
            ret.set_float(this.y);
        };
        exps.dt = function (ret)
        {
            ret.set_float(this.runtime.getDt(this));
        };
    }
    if (size_aces)
    {
        cnds.CompareWidth = function (cmp, w)
        {
            return cr.do_cmp(this.width, cmp, w);
        };
        cnds.CompareHeight = function (cmp, h)
        {
            return cr.do_cmp(this.height, cmp, h);
        };
        acts.SetWidth = function (w)
        {
            if (this.width !== w)
            {
                this.width = w;
                this.set_bbox_changed();
            }
        };
        acts.SetHeight = function (h)
        {
            if (this.height !== h)
            {
                this.height = h;
                this.set_bbox_changed();
            }
        };
        acts.SetSize = function (w, h)
        {
            if (this.width !== w || this.height !== h)
            {
                this.width = w;
                this.height = h;
                this.set_bbox_changed();
            }
        };
        exps.Width = function (ret)
        {
            ret.set_float(this.width);
        };
        exps.Height = function (ret)
        {
            ret.set_float(this.height);
        };
    }
    if (angle_aces)
    {
        cnds.AngleWithin = function (within, a)
        {
            return cr.angleDiff(this.angle, cr.to_radians(a)) <= cr.to_radians(within);
        };
        cnds.IsClockwiseFrom = function (a)
        {
            return cr.angleClockwise(this.angle, cr.to_radians(a));
        };
		cnds.IsBetweenAngles = function (a, b)
		{
			var lower = cr.to_clamped_radians(a);
			var upper = cr.to_clamped_radians(b);
			var angle = cr.clamp_angle(this.angle);
			var obtuse = (!cr.angleClockwise(upper, lower));
			if (obtuse)
				return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
			else
				return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper);
		};
        acts.SetAngle = function (a)
        {
            var newangle = cr.to_radians(cr.clamp_angle_degrees(a));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.RotateClockwise = function (a)
        {
            if (a !== 0 && !isNaN(a))
            {
                this.angle += cr.to_radians(a);
                this.angle = cr.clamp_angle(this.angle);
                this.set_bbox_changed();
            }
        };
        acts.RotateCounterclockwise = function (a)
        {
            if (a !== 0 && !isNaN(a))
            {
                this.angle -= cr.to_radians(a);
                this.angle = cr.clamp_angle(this.angle);
                this.set_bbox_changed();
            }
        };
        acts.RotateTowardAngle = function (amt, target)
        {
            var newangle = cr.angleRotate(this.angle, cr.to_radians(target), cr.to_radians(amt));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.RotateTowardPosition = function (amt, x, y)
        {
            var dx = x - this.x;
            var dy = y - this.y;
            var target = Math.atan2(dy, dx);
            var newangle = cr.angleRotate(this.angle, target, cr.to_radians(amt));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.SetTowardPosition = function (x, y)
        {
            var dx = x - this.x;
            var dy = y - this.y;
            var newangle = Math.atan2(dy, dx);
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        exps.Angle = function (ret)
        {
            ret.set_float(cr.to_clamped_degrees(this.angle));
        };
    }
    if (!singleglobal_)
    {
        cnds.CompareInstanceVar = function (iv, cmp, val)
        {
            return cr.do_cmp(this.instance_vars[iv], cmp, val);
        };
        cnds.IsBoolInstanceVarSet = function (iv)
        {
            return this.instance_vars[iv];
        };
		cnds.PickByUID = function (u)
		{
			return this.uid === u;
		};
		cnds.OnCreated = function ()
		{
			return true;
		};
		cnds.OnDestroyed = function ()
		{
			return true;
		};
        acts.SetInstanceVar = function (iv, val)
        {
			var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] = val;
                else
                    myinstvars[iv] = parseFloat(val);
            }
            else if (cr.is_string(myinstvars[iv]))
            {
                if (cr.is_string(val))
                    myinstvars[iv] = val;
                else
                    myinstvars[iv] = val.toString();
            }
            else
;
        };
        acts.AddInstanceVar = function (iv, val)
        {
			var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] += val;
                else
                    myinstvars[iv] += parseFloat(val);
            }
            else if (cr.is_string(myinstvars[iv]))
            {
                if (cr.is_string(val))
                    myinstvars[iv] += val;
                else
                    myinstvars[iv] += val.toString();
            }
            else
;
        };
        acts.SubInstanceVar = function (iv, val)
        {
			var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] -= val;
                else
                    myinstvars[iv] -= parseFloat(val);
            }
            else
;
        };
        acts.SetBoolInstanceVar = function (iv, val)
        {
            this.instance_vars[iv] = val ? 1 : 0;
        };
        acts.ToggleBoolInstanceVar = function (iv)
        {
            this.instance_vars[iv] = 1 - this.instance_vars[iv];
        };
        acts.Destroy = function ()
        {
            this.runtime.DestroyInstance(this);
        };
        exps.Count = function (ret)
        {
			var count = ret.object_class.instances.length;
			var i, len, inst;
			for (i = 0, len = this.runtime.createRow.length; i < len; i++)
			{
				inst = this.runtime.createRow[i];
				if (ret.object_class.is_family)
				{
					if (inst.type.families.indexOf(ret.object_class) >= 0)
						count++;
				}
				else
				{
					if (inst.type === ret.object_class)
						count++;
				}
			}
            ret.set_int(count);
        };
		exps.PickedCount = function (ret)
        {
            ret.set_int(ret.object_class.getCurrentSol().getObjects().length);
        };
		exps.UID = function (ret)
		{
			ret.set_int(this.uid);
		};
		exps.IID = function (ret)
		{
			ret.set_int(this.get_iid());
		};
    }
    if (appearance_aces)
    {
        cnds.IsVisible = function ()
        {
            return this.visible;
        };
        acts.SetVisible = function (v)
        {
			if (!v !== !this.visible)
			{
				this.visible = v;
				this.runtime.redraw = true;
			}
        };
        cnds.CompareOpacity = function (cmp, x)
        {
            return cr.do_cmp(cr.round6dp(this.opacity * 100), cmp, x);
        };
        acts.SetOpacity = function (x)
        {
            var new_opacity = x / 100.0;
            if (new_opacity < 0)
                new_opacity = 0;
            else if (new_opacity > 1)
                new_opacity = 1;
            if (new_opacity !== this.opacity)
            {
                this.opacity = new_opacity;
                this.runtime.redraw = true;
            }
        };
        exps.Opacity = function (ret)
        {
            ret.set_float(cr.round6dp(this.opacity * 100.0));
        };
    }
	if (zorder_aces)
	{
		cnds.IsOnLayer = function (layer_)
		{
			if (!layer_)
				return false;
			return this.layer === layer_;
		};
		cnds.PickTopBottom = function (which_)
		{
			var sol = this.getCurrentSol();
			var instances = sol.getObjects();
			if (!instances.length)
				return false;
			var inst = instances[0];
			var pickme = inst;
			var i, len;
			for (i = 1, len = instances.length; i < len; i++)
			{
				inst = instances[i];
				if (which_ === 0)
				{
					if (inst.layer.index > pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() > pickme.get_zindex()))
					{
						pickme = inst;
					}
				}
				else
				{
					if (inst.layer.index < pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() < pickme.get_zindex()))
					{
						pickme = inst;
					}
				}
			}
			sol.pick_one(pickme);
			return true;
		};
		acts.MoveToTop = function ()
		{
			var zindex = this.get_zindex();
			if (zindex === this.layer.instances.length - 1)
				return;
			cr.arrayRemove(this.layer.instances, zindex);
			this.layer.instances.push(this);
			this.runtime.redraw = true;
			this.layer.zindices_stale = true;
		};
		acts.MoveToBottom = function ()
		{
			var zindex = this.get_zindex();
			if (zindex === 0)
				return;
			cr.arrayRemove(this.layer.instances, zindex);
			this.layer.instances.unshift(this);
			this.runtime.redraw = true;
			this.layer.zindices_stale = true;
		};
		acts.MoveToLayer = function (layerMove)
		{
			if (!layerMove || layerMove == this.layer)
				return;
			cr.arrayRemove(this.layer.instances, this.get_zindex());
			this.layer.zindices_stale = true;
			this.layer = layerMove;
			this.zindex = layerMove.instances.length;
			layerMove.instances.push(this);
			this.runtime.redraw = true;
		};
		exps.LayerNumber = function (ret)
		{
			ret.set_int(this.layer.number);
		};
		exps.LayerName = function (ret)
		{
			ret.set_string(this.layer.name);
		};
		exps.ZIndex = function (ret)
		{
			ret.set_int(this.get_zindex());
		};
	}
	if (effects_aces)
	{
		acts.SetEffectEnabled = function (enable_, effectname_)
		{
			if (!this.runtime.glwrap)
				return;
			var i = this.type.getEffectIndexByName(effectname_);
			if (i < 0)
				return;		// effect name not found
			var enable = (enable_ === 1);
			if (this.active_effect_flags[i] === enable)
				return;		// no change
			this.active_effect_flags[i] = enable;
			this.updateActiveEffects();
			this.runtime.redraw = true;
		};
		acts.SetEffectParam = function (effectname_, index_, value_)
		{
			if (!this.runtime.glwrap)
				return;
			var i = this.type.getEffectIndexByName(effectname_);
			if (i < 0)
				return;		// effect name not found
			var et = this.type.effect_types[i];
			var params = this.effect_params[i];
			index_ = Math.floor(index_);
			if (index_ < 0 || index_ >= params.length)
				return;		// effect index out of bounds
			if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
				value_ /= 100.0;
			if (params[index_] === value_)
				return;		// no change
			params[index_] = value_;
			if (et.active)
				this.runtime.redraw = true;
		};
	}
};
cr.set_bbox_changed = function ()
{
    this.bbox_changed = true;       // will recreate next time box requested
    this.runtime.redraw = true;     // assume runtime needs to redraw
	var i, len;
	for (i = 0, len = this.bbox_changed_callbacks.length; i < len; i++)
	{
		this.bbox_changed_callbacks[i](this);
	}
};
cr.add_bbox_changed_callback = function (f)
{
	if (f)
		this.bbox_changed_callbacks.push(f);
};
cr.update_bbox = function ()
{
    if (!this.bbox_changed)
        return;                 // bounding box not changed
    this.bbox.set(this.x, this.y, this.x + this.width, this.y + this.height);
    this.bbox.offset(-this.hotspotX * this.width, -this.hotspotY * this.height);
    if (!this.angle)
    {
        this.bquad.set_from_rect(this.bbox);    // make bounding quad from box
    }
    else
    {
        this.bbox.offset(-this.x, -this.y);       					// translate to origin
        this.bquad.set_from_rotated_rect(this.bbox, this.angle);	// rotate around origin
        this.bquad.offset(this.x, this.y);      					// translate back to original position
        this.bquad.bounding_box(this.bbox);
    }
	var temp = 0;
	if (this.bbox.left > this.bbox.right)
	{
		temp = this.bbox.left;
		this.bbox.left = this.bbox.right;
		this.bbox.right = temp;
	}
	if (this.bbox.top > this.bbox.bottom)
	{
		temp = this.bbox.top;
		this.bbox.top = this.bbox.bottom;
		this.bbox.bottom = temp;
	}
    this.bbox_changed = false;  // bounding box up to date
};
cr.inst_contains_pt = function (x, y)
{
	if (!this.bbox.contains_pt(x, y))
		return false;
	if (!this.bquad.contains_pt(x, y))
		return false;
	if (this.collision_poly && !this.collision_poly.is_empty())
	{
		this.collision_poly.cache_poly(this.width, this.height, this.angle);
		return this.collision_poly.contains_pt(x - this.x, y - this.y);
	}
	else
		return true;
};
cr.inst_get_iid = function ()
{
	this.type.updateIIDs();
	return this.iid;
};
cr.inst_get_zindex = function ()
{
	this.layer.updateZIndices();
	return this.zindex;
};
cr.inst_updateActiveEffects = function ()
{
	this.active_effect_types.length = 0;
	var i, len, et, inst;
	for (i = 0, len = this.active_effect_flags.length; i < len; i++)
	{
		if (this.active_effect_flags[i])
			this.active_effect_types.push(this.type.effect_types[i]);
	}
	this.uses_shaders = !!this.active_effect_types.length;
};
cr.inst_toString = function ()
{
	return "inst:" + this.type.name + "#" + this.uid;
};
cr.type_getFirstPicked = function ()
{
    var instances = this.getCurrentSol().getObjects();
    if (instances.length)
        return instances[0];
    else
        return null;
};
cr.type_getPairedInstance = function (inst)
{
	var instances = this.getCurrentSol().getObjects();
	if (instances.length)
		return instances[inst.get_iid() % instances.length];
	else
		return null;
};
cr.type_updateIIDs = function ()
{
	if (!this.stale_iids || this.is_family)
		return;		// up to date or is family - don't want family to overwrite IIDs
	var i, len;
	for (i = 0, len = this.instances.length; i < len; i++)
		this.instances[i].iid = i;
	this.stale_iids = false;
};
cr.type_getCurrentSol = function ()
{
    return this.solstack[this.cur_sol];
};
cr.type_pushCleanSol = function ()
{
    this.cur_sol++;
    if (this.cur_sol === this.solstack.length)
        this.solstack.push(new cr.selection(this));
    else
        this.solstack[this.cur_sol].select_all = true;  // else clear next SOL
};
cr.type_pushCopySol = function ()
{
    this.cur_sol++;
    if (this.cur_sol === this.solstack.length)
        this.solstack.push(new cr.selection(this));
    var clonesol = this.solstack[this.cur_sol];
    var prevsol = this.solstack[this.cur_sol - 1];
    if (prevsol.select_all)
        clonesol.select_all = true;
    else
    {
        clonesol.select_all = false;
		cr.shallowAssignArray(clonesol.instances, prevsol.instances);
    }
};
cr.type_popSol = function ()
{
;
    this.cur_sol--;
};
cr.type_getBehaviorByName = function (behname)
{
    var i, len, j, lenj, f, index = 0;
	if (!this.is_family)
	{
		for (i = 0, len = this.families.length; i < len; i++)
		{
			f = this.families[i];
			for (j = 0, lenj = f.behaviors.length; j < lenj; j++)
			{
				if (behname === f.behaviors[j].name)
				{
					this.extra.lastBehIndex = index;
					return f.behaviors[j];
				}
				index++;
			}
		}
	}
    for (i = 0, len = this.behaviors.length; i < len; i++) {
        if (behname === this.behaviors[i].name)
		{
			this.extra.lastBehIndex = index;
            return this.behaviors[i];
		}
		index++;
    }
	return null;
};
cr.type_getBehaviorIndexByName = function (behname)
{
    var b = this.getBehaviorByName(behname);
	if (b)
		return this.extra.lastBehIndex;
	else
		return -1;
};
cr.type_getEffectIndexByName = function (name_)
{
	var i, len;
	for (i = 0, len = this.effect_types.length; i < len; i++)
	{
		if (this.effect_types[i].name === name_)
			return i;
	}
	return -1;
};
cr.type_applySolToContainer = function ()
{
	if (!this.is_contained || this.is_family)
		return;
	var i, len, j, lenj, t, sol, sol2;
	this.updateIIDs();
	sol = this.getCurrentSol();
	var select_all = sol.select_all;
	var es = this.runtime.getCurrentEventStack();
	var orblock = es && es.current_event && es.current_event.orblock;
	for (i = 0, len = this.container.length; i < len; i++)
	{
		t = this.container[i];
		if (t === this)
			continue;
		t.updateIIDs();
		sol2 = t.getCurrentSol();
		sol2.select_all = select_all;
		if (!select_all)
		{
			sol2.instances.length = sol.instances.length;
			sol2.else_instances.length = sol.instances.length;
			for (j = 0, lenj = sol.instances.length; j < lenj; j++)
				sol2.instances[j] = t.instances[sol.instances[j].iid];
			if (orblock)
			{
				for (j = 0, lenj = sol.else_instances.length; j < lenj; j++)
					sol2.else_instances[j] = t.instances[sol.else_instances[j].iid];
			}
		}
	}
};
cr.type_toString = function ()
{
	return this.name;
};
cr.do_cmp = function (x, cmp, y)
{
	if (typeof x === "undefined" || typeof y === "undefined")
		return false;
    switch (cmp)
    {
        case 0:     // equal
            return x === y;
        case 1:     // not equal
            return x !== y;
        case 2:     // less
            return x < y;
        case 3:     // less/equal
            return x <= y;
        case 4:     // greater
            return x > y;
        case 5:     // greater/equal
            return x >= y;
        default:
;
            return false;
    }
};
cr.shaders = {};
;
;
cr.plugins_.Audio = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Audio.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	var audRuntime = null;
	var audInst = null;
	var audTag = "";
	var appPath = "";			// for PhoneGap only
	var API_HTML5 = 0;
	var API_WEBAUDIO = 1;
	var API_PHONEGAP = 2;
	var API_APPMOBI = 3;
	var api = API_HTML5;
	var context = null;
	var audioBuffers = [];		// cache of buffers
	var audioInstances = [];	// cache of instances
	var lastAudio = null;
	var useOgg = false;			// determined at create time
	var timescale_mode = 0;
	var silent = false;
	var iOShadtouch = false;	// has had touch input on iOS to work around web audio API muting
	var iOStoplay = [];			// array to call noteOn(0) on when first touch arrives
	function C2AudioBuffer(src_, is_music)
	{
		this.src = src_;
		this.myapi = api;
		this.is_music = is_music;
		this.added_end_listener = false;
		var self = this;
		if (api === API_WEBAUDIO && is_music && !audRuntime.isAwesomium && !audRuntime.isiOS)
			this.myapi = API_HTML5;
		this.bufferObject = null;
		var request;
		switch (this.myapi) {
		case API_HTML5:
			if (is_music && audRuntime.isCocoonJs)
				CocoonJS["App"]["markAsMusic"](src_);
			this.bufferObject = new Audio();
			this.bufferObject.autoplay = false;	// this is only a source buffer, not an instance
			this.bufferObject.preload = "auto";
			this.bufferObject.src = src_;
			break;
		case API_WEBAUDIO:
			request = new XMLHttpRequest();
			request.open("GET", src_, true);
			request.responseType = "arraybuffer";
			request.onload = function () {
				if (context["decodeAudioData"])
				{
					context["decodeAudioData"](request.response, function (buffer) {
							self.bufferObject = buffer;
							if (!cr.is_undefined(self.playTagWhenReady))
							{
								var a = new C2AudioInstance(self, self.playTagWhenReady);
								a.play(self.loopWhenReady, self.volumeWhenReady);
								audioInstances.push(a);
							}
					});
				}
				else
				{
					self.bufferObject = context["createBuffer"](request.response, false);
					if (!cr.is_undefined(self.playTagWhenReady))
					{
						var a = new C2AudioInstance(self, self.playTagWhenReady);
						a.play(self.loopWhenReady, self.volumeWhenReady);
						audioInstances.push(a);
					}
				}
			};
			request.send();
			break;
		case API_PHONEGAP:
			this.bufferObject = true;
			break;
		case API_APPMOBI:
			this.bufferObject = true;
			break;
		}
	};
	C2AudioBuffer.prototype.isLoaded = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			return this.bufferObject["readyState"] === 4;	// HAVE_ENOUGH_DATA
		case API_WEBAUDIO:
			return !!this.bufferObject;			// null until AJAX request completes
		case API_PHONEGAP:
			return true;
		case API_APPMOBI:
			return true;
		}
		return false;
	};
	function C2AudioInstance(buffer_, tag_)
	{
		this.tag = tag_;
		this.fresh = true;
		this.stopped = true;
		this.src = buffer_.src;
		this.buffer = buffer_;
		this.myapi = buffer_.myapi;
		this.is_music = buffer_.is_music;
		this.playbackRate = 1;
		this.pgended = true;			// for PhoneGap only: ended flag
		this.resume_me = false;			// make sure resumes when leaving suspend
		this.looping = false;
		var self = this;
		this.volume = 1;
		this.mutevol = 1;
		this.startTime = audRuntime.kahanTime.sum;
		this.instanceObject = null;
		var add_end_listener = false;
		switch (this.myapi) {
		case API_HTML5:
			if (this.is_music)
			{
				this.instanceObject = buffer_.bufferObject;
				add_end_listener = !buffer_.added_end_listener;
				buffer_.added_end_listener = true;
			}
			else
			{
				this.instanceObject = new Audio();
				this.instanceObject.autoplay = false;
				this.instanceObject.src = buffer_.bufferObject.src;
				add_end_listener = true;
			}
			if (add_end_listener)
			{
				this.instanceObject.addEventListener('ended', function () {
						audTag = self.tag;
						self.stopped = true;
						audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
				});
			}
			break;
		case API_WEBAUDIO:
			if (buffer_.bufferObject)
			{
				this.instanceObject = context["createBufferSource"]();
				this.instanceObject["buffer"] = buffer_.bufferObject;
				this.instanceObject["connect"](context["destination"]);
			}
			break;
		case API_PHONEGAP:
			this.instanceObject = new window["Media"](appPath + this.src, null, null, function (status) {
					if (status === window["Media"]["MEDIA_STOPPED"])
					{
						self.pgended = true;
						self.stopped = true;
						audTag = self.tag;
						audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
					}
			});
			break;
		case API_APPMOBI:
			this.instanceObject = true;
			break;
		}
	};
	C2AudioInstance.prototype.hasEnded = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			return this.instanceObject.ended;
		case API_WEBAUDIO:
			if (!this.fresh && !this.stopped && this.instanceObject["loop"])
				return false;
			return (audRuntime.kahanTime.sum - this.startTime) > this.buffer.bufferObject["duration"];
		case API_PHONEGAP:
			return this.pgended;
		case API_APPMOBI:
			true;	// recycling an AppMobi sound does not matter because it will just do another throwaway playSound
		}
		return true;
	};
	C2AudioInstance.prototype.canBeRecycled = function ()
	{
		if (this.fresh || this.stopped)
			return true;		// not yet used or is not playing
		return this.hasEnded();
	};
	C2AudioInstance.prototype.play = function (looping, vol)
	{
		var instobj = this.instanceObject;
		this.looping = looping;
		switch (this.myapi) {
		case API_HTML5:
			if (instobj.playbackRate !== 1.0)
				instobj.playbackRate = 1.0;
			if (instobj.volume !== vol)
				instobj.volume = vol;
			if (instobj.loop !== looping)
				instobj.loop = looping;
			if (instobj.muted)
				instobj.muted = false;
			if (!this.fresh && this.stopped && instobj.currentTime !== 0)
			{
				try {
					instobj.currentTime = 0;
				}
				catch (err)
				{
;
				}
			}
			this.instanceObject.play();
			break;
		case API_WEBAUDIO:
			this.muted = false;
			this.volume = vol;
			this.mutevol = 1;
			if (audRuntime.isiOS && iOStoplay.length > 3)
				break;
			if (!this.fresh)
			{
				this.instanceObject = context["createBufferSource"]();
				this.instanceObject["buffer"] = this.buffer.bufferObject;
				this.instanceObject["connect"](context["destination"]);
			}
			this.instanceObject.loop = looping;
			this.instanceObject["gain"]["value"] = vol;
			if (audRuntime.isiOS && !iOShadtouch)
				iOStoplay.push(this.instanceObject);
			else
				this.instanceObject["noteOn"](0);
			break;
		case API_PHONEGAP:
			if (!this.fresh && this.stopped)
				instobj["seekTo"](0);
			instobj["play"]();
			this.pgended = false;
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["playSound"](this.src);
			else
				AppMobi["player"]["playSound"](this.src);
			break;
		}
		this.playbackRate = 1;
		this.startTime = audRuntime.kahanTime.sum;
		this.fresh = false;
		this.stopped = false;
	};
	C2AudioInstance.prototype.stop = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			if (!this.instanceObject.paused)
				this.instanceObject.pause();
			break;
		case API_WEBAUDIO:
			this.instanceObject["noteOff"](0);
			break;
		case API_PHONEGAP:
			this.instanceObject["stop"]();
			break;
		case API_APPMOBI:
			break;
		}
		this.stopped = true;
	};
	C2AudioInstance.prototype.setVolume = function (v)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.volume && this.instanceObject.volume !== v)
				this.instanceObject.volume = v;
			break;
		case API_WEBAUDIO:
			this.volume = v;
			this.instanceObject["gain"]["value"] = v * this.mutevol;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setMuted = function (m)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.muted !== !!m)
				this.instanceObject.muted = !!m;
			break;
		case API_WEBAUDIO:
			this.mutevol = (m ? 0 : 1);
			this.instanceObject["gain"]["value"] = this.volume * this.mutevol;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setLooping = function (l)
	{
		this.looping = l;
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.loop !== !!l)
				this.instanceObject.loop = !!l;
			break;
		case API_WEBAUDIO:
			if (this.instanceObject.loop !== !!l)
				this.instanceObject.loop = !!l;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setPlaybackRate = function (r)
	{
		this.playbackRate = r;
		this.updatePlaybackRate();
	};
	C2AudioInstance.prototype.updatePlaybackRate = function ()
	{
		var r = this.playbackRate;
		if ((timescale_mode === 1 && !this.is_music) || timescale_mode === 2)
			r *= audRuntime.timescale;
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.playbackRate !== r)
				this.instanceObject.playbackRate = r;
			break;
		case API_WEBAUDIO:
			if (this.instanceObject["playbackRate"]["value"] !== r)
				this.instanceObject["playbackRate"]["value"] = r;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setSuspended = function (s)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (s)
			{
				if (!this.fresh && !this.stopped)
				{
					this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
					this.instanceObject["play"]();
			}
			break;
		case API_WEBAUDIO:
			if (s)
			{
				if (!this.fresh && !this.stopped)
				{
					this.instanceObject["noteOff"](0);
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
				{
					this.instanceObject = context["createBufferSource"]();
					this.instanceObject["buffer"] = this.buffer.bufferObject;
					this.instanceObject["connect"](context["destination"]);
					this.instanceObject.loop = this.looping;
					this.instanceObject["gain"]["value"] = this.volume * this.mutevol;
					this.instanceObject["noteOn"](0);
				}
			}
			break;
		case API_PHONEGAP:
			if (s)
			{
				if (!this.fresh && !this.stopped)
				{
					this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
					this.instanceObject["play"]();
			}
			break;
		case API_APPMOBI:
			break;
		}
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		audRuntime = this.runtime;
		audInst = this;
		context = null;
		if (typeof AudioContext !== "undefined")
		{
			api = API_WEBAUDIO;
			context = new AudioContext();
		}
		else if (typeof webkitAudioContext !== "undefined")
		{
			api = API_WEBAUDIO;
			context = new webkitAudioContext();
		}
		if (this.runtime.isiOS && api === API_WEBAUDIO)
		{
			document.addEventListener("touchstart", function () {
				if (iOShadtouch)
					return;
				if (iOStoplay.length)
					iOShadtouch = true;
				var i, len;
				for (i = 0, len = iOStoplay.length; i < len; i++)
					iOStoplay[i]["noteOn"](0);
				iOStoplay.length = 0;		// GC the buffers
			}, false);
		}
		if (api !== API_WEBAUDIO)
		{
			if (this.runtime.isPhoneGap)
				api = API_PHONEGAP;
			else if (this.runtime.isAppMobi)
				api = API_APPMOBI;
		}
		if (api === API_PHONEGAP)
		{
			appPath = location.href;
			var i = appPath.lastIndexOf("/");
			if (i > -1)
				appPath = appPath.substr(0, i + 1);
			appPath = appPath.replace("file://", "");
		}
		if (this.runtime.isSafari && this.runtime.isWindows && typeof Audio === "undefined")
		{
			alert("It looks like you're using Safari for Windows without Quicktime.  Audio cannot be played until Quicktime is installed.");
			this.runtime.DestroyInstance(this);
		}
		else
		{
			if (this.runtime.isDirectCanvas)
				useOgg = this.runtime.isAndroid;		// AAC on iOS, OGG on Android
			else
				useOgg = !!(new Audio().canPlayType('audio/ogg; codecs="vorbis"'));
			switch (api) {
			case API_HTML5:
;
				break;
			case API_WEBAUDIO:
;
				break;
			case API_PHONEGAP:
;
				break;
			case API_APPMOBI:
;
				break;
			default:
;
			}
			this.runtime.tickMe(this);
		}
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function ()
	{
		timescale_mode = this.properties[0];	// 0 = off, 1 = sounds only, 2 = all
		this.runtime.addSuspendCallback(function(s)
		{
			audInst.onSuspend(s);
		});
	};
	instanceProto.onSuspend = function (s)
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].setSuspended(s);
	};
	instanceProto.tick = function ()
	{
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (a.myapi !== API_HTML5 && a.myapi !== API_APPMOBI)
			{
				if (!a.fresh && !a.stopped && a.hasEnded())
				{
					a.stopped = true;
					audTag = a.tag;
					audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
				}
			}
			if (timescale_mode !== 0)
				a.updatePlaybackRate();
		}
	};
	instanceProto.getAudioBuffer = function (src_, is_music)
	{
		var i, len, a;
		for (i = 0, len = audioBuffers.length; i < len; i++)
		{
			a = audioBuffers[i];
			if (a.src === src_)
				return a;
		}
		a = new C2AudioBuffer(src_, is_music);
		audioBuffers.push(a);
		return a;
	};
	instanceProto.getAudioInstance = function (src_, tag, is_music, looping, vol)
	{
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (a.src === src_ && a.canBeRecycled())
			{
				a.tag = tag;
				return a;
			}
		}
		var b = this.getAudioBuffer(src_, is_music);
		if (!b.bufferObject)
		{
			if (tag !== "<preload>")
			{
				b.playTagWhenReady = tag;
				b.loopWhenReady = looping;
				b.volumeWhenReady = vol;
			}
			return null;
		}
		a = new C2AudioInstance(b, tag);
		audioInstances.push(a);
		return a;
	};
	var taggedAudio = [];
	instanceProto.getAudioByTag = function (tag)
	{
		taggedAudio.length = 0;
		if (!tag.length)
		{
			if (!lastAudio || lastAudio.hasEnded())
				return;
			else
			{
				taggedAudio.length = 1;
				taggedAudio[0] = lastAudio;
				return;
			}
		}
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (tag.toLowerCase() === a.tag.toLowerCase())
				taggedAudio.push(a);
		}
	};
	function Cnds() {};
	Cnds.prototype.OnEnded = function (t)
	{
		return audTag.toLowerCase() === t.toLowerCase();
	};
	Cnds.prototype.PreloadsComplete = function ()
	{
		var i, len;
		for (i = 0, len = audioBuffers.length; i < len; i++)
		{
			if (!audioBuffers[i].isLoaded())
				return false;
		}
		return true;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Play = function (file, looping, vol, tag)
	{
		if (silent)
			return;
		var v = Math.pow(10, vol / 20);
		if (v < 0)
			v = 0;
		if (v > 1)
			v = 1;
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
			return;
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayByName = function (folder, filename, looping, vol, tag)
	{
		if (silent)
			return;
		var v = Math.pow(10, vol / 20);
		if (v < 0)
			v = 0;
		if (v > 1)
			v = 1;
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
			return;
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.SetLooping = function (tag, looping)
	{
		this.getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setLooping(looping === 0);
	};
	Acts.prototype.SetMuted = function (tag, muted)
	{
		this.getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setMuted(muted === 0);
	};
	Acts.prototype.SetVolume = function (tag, vol)
	{
		this.getAudioByTag(tag);
		var v = Math.pow(10, vol / 20);
		if (v < 0)
			v = 0;
		if (v > 1)
			v = 1;
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setVolume(v);
	};
	Acts.prototype.Preload = function (file)
	{
		if (silent)
			return;
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		if (api === API_APPMOBI)
		{
			if (this.runtime.isDirectCanvas)
				AppMobi["context"]["loadSound"](src);
			else
				AppMobi["player"]["loadSound"](src);
			return;
		}
		else if (api === API_PHONEGAP)
		{
			return;
		}
		this.getAudioInstance(src, "<preload>", is_music, false);
	};
	Acts.prototype.PreloadByName = function (folder, filename)
	{
		if (silent)
			return;
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		if (api === API_APPMOBI)
		{
			if (this.runtime.isDirectCanvas)
				AppMobi["context"]["loadSound"](src);
			else
				AppMobi["player"]["loadSound"](src);
			return;
		}
		else if (api === API_PHONEGAP)
		{
			return;
		}
		this.getAudioInstance(src, "<preload>", is_music, false);
	};
	Acts.prototype.SetPlaybackRate = function (tag, rate)
	{
		this.getAudioByTag(tag);
		if (rate < 0.0)
			rate = 0;
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setPlaybackRate(rate);
	};
	Acts.prototype.Stop = function (tag)
	{
		this.getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].stop();
	};
	Acts.prototype.SetSilent = function (s)
	{
		var i, len;
		if (s === 2)					// toggling
			s = (silent ? 1 : 0);		// choose opposite state
		if (s === 0 && !silent)			// setting silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setMuted(true);
			silent = true;
		}
		else if (s === 1 && silent)		// setting not silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setMuted(false);
			silent = false;
		}
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Keyboard = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Keyboard.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.keyMap = new Array(256);	// stores key up/down state
		this.usedKeys = new Array(256);
		this.triggerKey = 0;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		var self = this;
		if (!this.runtime.isDomFree)
		{
			jQuery(document).keydown(
				function(info) {
					self.onKeyDown(info);
				}
			);
			jQuery(document).keyup(
				function(info) {
					self.onKeyUp(info);
				}
			);
		}
	};
	instanceProto.onKeyDown = function (info)
	{
		if (this.keyMap[info.which])
		{
			if (this.usedKeys[info.which])
				info.preventDefault();
			return;
		}
		this.keyMap[info.which] = true;
		this.triggerKey = info.which;
		this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKey, this);
		var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKey, this);
		var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCode, this);
		if (eventRan || eventRan2)
		{
			this.usedKeys[info.which] = true;
			info.preventDefault();
		}
	};
	instanceProto.onKeyUp = function (info)
	{
		this.keyMap[info.which] = false;
		this.triggerKey = info.which;
		this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKeyReleased, this);
		var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyReleased, this);
		var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCodeReleased, this);
		if (eventRan || eventRan2 || this.usedKeys[info.which])
		{
			this.usedKeys[info.which] = true;
			info.preventDefault();
		}
	};
	function Cnds() {};
	Cnds.prototype.IsKeyDown = function(key)
	{
		return this.keyMap[key];
	};
	Cnds.prototype.OnKey = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.OnAnyKey = function(key)
	{
		return true;
	};
	Cnds.prototype.OnAnyKeyReleased = function(key)
	{
		return true;
	};
	Cnds.prototype.OnKeyReleased = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.IsKeyCodeDown = function(key)
	{
		key = Math.floor(key);
		if (key < 0 || key >= this.keyMap.length)
			return false;
		return this.keyMap[key];
	};
	Cnds.prototype.OnKeyCode = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.OnKeyCodeReleased = function(key)
	{
		return (key === this.triggerKey);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.LastKeyCode = function (ret)
	{
		ret.set_int(this.triggerKey);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Mouse = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Mouse.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.buttonMap = new Array(4);		// mouse down states
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;
		this.triggerButton = 0;
		this.triggerType = 0;
		this.triggerDir = 0;
		this.handled = false;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		var self = this;
		if (!this.runtime.isDomFree)
		{
			jQuery(document).mousemove(
				function(info) {
					self.onMouseMove(info);
				}
			);
			jQuery(document).mousedown(
				function(info) {
					self.onMouseDown(info);
				}
			);
			jQuery(document).mouseup(
				function(info) {
					self.onMouseUp(info);
				}
			);
			jQuery(document).dblclick(
				function(info) {
					self.onDoubleClick(info);
				}
			);
			var wheelevent = function(info) {
								self.onWheel(info);
							};
			document.addEventListener("mousewheel", wheelevent, false);
			document.addEventListener("DOMMouseScroll", wheelevent, false);
		}
	};
	var dummyoffset = {left: 0, top: 0};
	instanceProto.onMouseMove = function(info)
	{
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		this.mouseXcanvas = info.pageX - offset.left;
		this.mouseYcanvas = info.pageY - offset.top;
	};
	instanceProto.mouseInGame = function ()
	{
		if (this.runtime.fullscreen_mode > 0)
			return true;
		return this.mouseXcanvas >= 0 && this.mouseYcanvas >= 0
		    && this.mouseXcanvas < this.runtime.width && this.mouseYcanvas < this.runtime.height;
	};
	instanceProto.onMouseDown = function(info)
	{
		if (!this.mouseInGame())
			return;
		if (this.runtime.had_a_click)
			info.preventDefault();
		this.buttonMap[info.which] = true;
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnAnyClick, this);
		this.triggerButton = info.which - 1;	// 1-based
		this.triggerType = 0;					// single click
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick, this);
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked, this);
	};
	instanceProto.onMouseUp = function(info)
	{
		if (!this.buttonMap[info.which])
			return;
		if (this.runtime.had_a_click)
			info.preventDefault();
		this.runtime.had_a_click = true;
		this.buttonMap[info.which] = false;
		this.triggerButton = info.which - 1;	// 1-based
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnRelease, this);
	};
	instanceProto.onDoubleClick = function(info)
	{
		if (!this.mouseInGame())
			return;
		info.preventDefault();
		this.triggerButton = info.which - 1;	// 1-based
		this.triggerType = 1;					// double click
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick, this);
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked, this);
	};
	instanceProto.onWheel = function (info)
	{
		var delta = info.wheelDelta ? info.wheelDelta : info.detail ? -info.detail : 0;
		if (this.runtime.isAwesomium)
			delta *= -1;
		this.triggerDir = (delta < 0 ? 0 : 1);
		this.handled = false;
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnWheel, this);
		if (this.handled)
			info.preventDefault();
	};
	function Cnds() {};
	Cnds.prototype.OnClick = function (button, type)
	{
		return button === this.triggerButton && type === this.triggerType;
	};
	Cnds.prototype.OnAnyClick = function ()
	{
		return true;
	};
	Cnds.prototype.IsButtonDown = function (button)
	{
		return this.buttonMap[button + 1];	// jQuery uses 1-based buttons for some reason
	};
	Cnds.prototype.OnRelease = function (button)
	{
		return button === this.triggerButton;
	};
	Cnds.prototype.IsOverObject = function (obj)
	{
		var cnd = this.runtime.getCurrentCondition();
		if (cr.is_undefined(cnd.extra.mouseOverInverted))
		{
			cnd.extra.mouseOverInverted = cnd.inverted;
			cnd.inverted = false;
		}
		var mx = this.mouseXcanvas;
		var my = this.mouseYcanvas;
		return this.runtime.testAndSelectCanvasPointOverlap(obj, mx, my, cnd.extra.mouseOverInverted);
	};
	Cnds.prototype.OnObjectClicked = function (button, type, obj)
	{
		if (button !== this.triggerButton || type !== this.triggerType)
			return false;	// wrong click type
		return this.runtime.testAndSelectCanvasPointOverlap(obj, this.mouseXcanvas, this.mouseYcanvas, false);
	};
	Cnds.prototype.OnWheel = function (dir)
	{
		this.handled = true;
		return dir === this.triggerDir;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetCursor = function (c)
	{
		var cursor_style = ["auto", "pointer", "text", "crosshair", "move", "help", "wait", "none"][c];
		if (this.runtime.isAwesomium)
			window["c2awesomium"]["setCursor"](c);
		if (this.runtime.canvas && this.runtime.canvas.style)
			this.runtime.canvas.style.cursor = cursor_style;
	};
	Acts.prototype.SetCursorSprite = function (obj)
	{
		if (this.runtime.isDomFree || this.runtime.isMobile || !obj)
			return;
		var inst = obj.getFirstPicked();
		if (!inst || !inst.curFrame)
			return;
		var frame = inst.curFrame;
		var datauri = frame.getDataUri();
		var cursor_style = "url(" + datauri + ") " + Math.round(frame.hotspotX * frame.width) + " " + Math.round(frame.hotspotY * frame.height) + ", auto";
		jQuery(this.runtime.canvas).css("cursor", cursor_style);
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.X = function (ret, layerparam)
	{
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.Y = function (ret, layerparam)
	{
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.AbsoluteX = function (ret)
	{
		ret.set_float(this.mouseXcanvas);
	};
	Exps.prototype.AbsoluteY = function (ret)
	{
		ret.set_float(this.mouseYcanvas);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Rex_Pause = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Rex_Pause.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
        this.is_pause = false;
        this.previous_timescale = 0;
	};
	instanceProto.onDestroy = function ()
	{
        this._toogle_pause(false);
	};
	instanceProto._toogle_pause = function (state)
	{
        var cur_state = this.is_pause;
        if (state == cur_state)
            return;
        this.is_pause = (!cur_state);
        var trig_method;
        if (this.is_pause)
        {
            this.previous_timescale = this.runtime.timescale;
            this.runtime.timescale = 0;
            trig_method = cr.plugins_.Rex_Pause.prototype.cnds.OnPause;
        }
        else
        {
            this.runtime.timescale = this.previous_timescale;
            trig_method = cr.plugins_.Rex_Pause.prototype.cnds.OnResume;
        }
        this.runtime.trigger(trig_method, this);
	};
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	cnds.OnPause = function ()
	{
		return true;
	};
	cnds.OnResume = function ()
	{
		return true;
	};
	cnds.IsPause = function ()
	{
		return this.is_pause;
	};
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    acts.TooglePause = function ()
	{
        this._toogle_pause();
	};
    acts.SetState = function (state)
	{
        var is_pause = (state == 0);
        this._toogle_pause(is_pause);
	};
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    exps.Timescale = function (ret)
	{
	    ret.set_float( this.previous_timescale );
	};
}());
;
;
cr.plugins_.Sprite = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Sprite.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	function frame_getDataUri()
	{
		if (this.datauri.length === 0)
		{
			var tmpcanvas = document.createElement("canvas");
			tmpcanvas.width = this.width;
			tmpcanvas.height = this.height;
			var tmpctx = tmpcanvas.getContext("2d");
			if (this.spritesheeted)
			{
				tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height,
										 0, 0, this.width, this.height);
			}
			else
			{
				tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height);
			}
			this.datauri = tmpcanvas.toDataURL("image/png");
		}
		return this.datauri;
	};
	typeProto.onCreate = function()
	{
		if (this.is_family)
			return;
		var i, leni, j, lenj;
		var anim, frame, animobj, frameobj, wt, uv;
		for (i = 0, leni = this.animations.length; i < leni; i++)
		{
			anim = this.animations[i];
			animobj = {};
			animobj.name = anim[0];
			animobj.speed = anim[1];
			animobj.loop = anim[2];
			animobj.repeatcount = anim[3];
			animobj.repeatto = anim[4];
			animobj.pingpong = anim[5];
			animobj.frames = [];
			for (j = 0, lenj = anim[6].length; j < lenj; j++)
			{
				frame = anim[6][j];
				frameobj = {};
				frameobj.texture_file = frame[0];
				frameobj.texture_filesize = frame[1];
				frameobj.offx = frame[2];
				frameobj.offy = frame[3];
				frameobj.width = frame[4];
				frameobj.height = frame[5];
				frameobj.duration = frame[6];
				frameobj.hotspotX = frame[7];
				frameobj.hotspotY = frame[8];
				frameobj.image_points = frame[9];
				frameobj.poly_pts = frame[10];
				frameobj.pixelformat = frame[11];
				frameobj.spritesheeted = (frameobj.width !== 0);
				frameobj.datauri = "";		// generated on demand and cached
				frameobj.getDataUri = frame_getDataUri;
				uv = {};
				uv.left = 0;
				uv.top = 0;
				uv.right = 1;
				uv.bottom = 1;
				frameobj.sheetTex = uv;
				frameobj.webGL_texture = null;
				wt = this.runtime.findWaitingTexture(frame[0]);
				if (wt)
				{
					frameobj.texture_img = wt;
				}
				else
				{
					frameobj.texture_img = new Image();
					frameobj.texture_img.src = frame[0];
					frameobj.texture_img.cr_src = frame[0];
					frameobj.texture_img.cr_filesize = frame[1];
					frameobj.texture_img.c2webGL_texture = null;
					this.runtime.wait_for_textures.push(frameobj.texture_img);
				}
				cr.seal(frameobj);
				animobj.frames.push(frameobj);
			}
			cr.seal(animobj);
			this.animations[i] = animobj;		// swap array data for object
		}
	};
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
		var i, leni, j, lenj;
		var anim, frame, inst;
		for (i = 0, leni = this.animations.length; i < leni; i++)
		{
			anim = this.animations[i];
			for (j = 0, lenj = anim.frames.length; j < lenj; j++)
			{
				frame = anim.frames[j];
				frame.texture_img.c2webGL_texture = null;
				frame.webGL_texture = null;
			}
		}
	};
	typeProto.onRestoreWebGLContext = function ()
	{
		if (this.is_family || !this.instances.length)
			return;
		var i, leni, j, lenj;
		var anim, frame, inst;
		for (i = 0, leni = this.animations.length; i < leni; i++)
		{
			anim = this.animations[i];
			for (j = 0, lenj = anim.frames.length; j < lenj; j++)
			{
				frame = anim.frames[j];
				if (!frame.texture_img.c2webGL_texture)
				{
					frame.texture_img.c2webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat);
				}
				frame.webGL_texture = frame.texture_img.c2webGL_texture;
			}
		}
		for (i = 0, leni = this.instances.length; i < leni; i++)
		{
			inst = this.instances[i];
			inst.curWebGLTexture = inst.curFrame.webGL_texture;
		}
	};
	var all_my_textures = [];
	typeProto.unloadTextures = function ()
	{
		if (this.is_family || this.instances.length)
			return;
		var isWebGL = !!this.runtime.glwrap;
		var i, leni, j, lenj, k;
		var anim, frame, inst, o;
		all_my_textures.length = 0;
		for (i = 0, leni = this.animations.length; i < leni; i++)
		{
			anim = this.animations[i];
			for (j = 0, lenj = anim.frames.length; j < lenj; j++)
			{
				frame = anim.frames[j];
				o = (isWebGL ? frame.texture_img.c2webGL_texture : frame.texture_img);
				if (!o)
					continue;
				k = all_my_textures.indexOf(o);
				if (k === -1)
					all_my_textures.push(o);
				frame.texture_img.c2webGL_texture = null;
				frame.webGL_texture = null;
			}
		}
		for (i = 0, leni = all_my_textures.length; i < leni; i++)
		{
			o = all_my_textures[i];
			if (isWebGL)
				this.runtime.glwrap.deleteTexture(o);
			else if (o["hintUnload"])
				o["hintUnload"]();
		}
		all_my_textures.length = 0;
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.collision_poly = new cr.CollisionPoly(this.type.animations[0].frames[0].poly_pts);
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		this.visible = (this.properties[0] === 0);	// 0=visible, 1=invisible
		this.isTicking = false;
		this.inAnimTrigger = false;
		this.collisionsEnabled = (this.properties[2] !== 0);
		if (!(this.type.animations.length === 1 && this.type.animations[0].frames.length === 1) && this.type.animations[0].speed !== 0)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		this.cur_animation = this.type.animations[0];
		this.cur_frame = this.properties[1];
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (this.cur_frame !== 0)
		{
			var curanimframe = this.cur_animation.frames[this.cur_frame];
			this.collision_poly.set_pts(curanimframe.poly_pts);
			this.hotspotX = curanimframe.hotspotX;
			this.hotspotY = curanimframe.hotspotY;
		}
		this.cur_anim_speed = this.type.animations[0].speed;
		this.frameStart = this.getNowTime();
		this.animPlaying = true;
		this.animRepeats = 0;
		this.animForwards = true;
		this.animTriggerName = "";
		this.changeAnimName = "";
		this.changeAnimFrom = 0;
		this.changeAnimFrame = -1;
		var i, leni, j, lenj;
		var anim, frame, uv, maintex;
		for (i = 0, leni = this.type.animations.length; i < leni; i++)
		{
			anim = this.type.animations[i];
			for (j = 0, lenj = anim.frames.length; j < lenj; j++)
			{
				frame = anim.frames[j];
				if (frame.texture_img["hintLoad"])
					frame.texture_img["hintLoad"]();
				if (frame.width === 0)
				{
					frame.width = frame.texture_img.width;
					frame.height = frame.texture_img.height;
				}
				if (frame.spritesheeted)
				{
					maintex = frame.texture_img;
					uv = frame.sheetTex;
					uv.left = frame.offx / maintex.width;
					uv.top = frame.offy / maintex.height;
					uv.right = (frame.offx + frame.width) / maintex.width;
					uv.bottom = (frame.offy + frame.height) / maintex.height;
					if (frame.offx === 0 && frame.offy === 0 && frame.width === maintex.width && frame.height === maintex.height)
					{
						frame.spritesheeted = false;
					}
				}
				if (this.runtime.glwrap)
				{
					if (!frame.texture_img.c2webGL_texture)
					{
						frame.texture_img.c2webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat);
					}
					frame.webGL_texture = frame.texture_img.c2webGL_texture;
				}
			}
		}
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture;
	};
	instanceProto.animationFinish = function (reverse)
	{
		this.cur_frame = reverse ? 0 : this.cur_animation.frames.length - 1;
		this.animPlaying = false;
		this.animTriggerName = this.cur_animation.name;
		this.inAnimTrigger = true;
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnyAnimFinished, this);
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnimFinished, this);
		this.inAnimTrigger = false;
		this.animRepeats = 0;
	};
	instanceProto.getNowTime = function()
	{
		return (Date.now() - this.runtime.start_time) / 1000.0;
	};
	instanceProto.tick = function()
	{
		if (this.changeAnimName.length)
			this.doChangeAnim();
		if (this.changeAnimFrame >= 0)
			this.doChangeAnimFrame();
		var now = this.getNowTime();
		var cur_animation = this.cur_animation;
		var prev_frame = cur_animation.frames[this.cur_frame];
		var next_frame;
		var cur_frame_time = prev_frame.duration / this.cur_anim_speed;
		var cur_timescale = this.runtime.timescale;
		if (this.my_timescale !== -1.0)
			cur_timescale = this.my_timescale;
		cur_frame_time /= (cur_timescale === 0 ? 0.000000001 : cur_timescale);
		if (this.animPlaying && now >= this.frameStart + cur_frame_time)
		{
			if (this.animForwards)
			{
				this.cur_frame++;
			}
			else
			{
				this.cur_frame--;
			}
			this.frameStart += cur_frame_time;
			if (this.cur_frame >= cur_animation.frames.length)
			{
				if (cur_animation.pingpong)
				{
					this.animForwards = false;
					this.cur_frame = cur_animation.frames.length - 2;
				}
				else if (cur_animation.loop)
				{
					this.cur_frame = cur_animation.repeatto;
				}
				else
				{
					this.animRepeats++;
					if (this.animRepeats >= cur_animation.repeatcount)
					{
						this.animationFinish(false);
					}
					else
					{
						this.cur_frame = cur_animation.repeatto;
					}
				}
			}
			if (this.cur_frame < 0)
			{
				if (cur_animation.pingpong)
				{
					this.cur_frame = 1;
					this.animForwards = true;
					if (!cur_animation.loop)
					{
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount)
						{
							this.animationFinish(true);
						}
					}
				}
				else
				{
					if (cur_animation.loop)
					{
						this.cur_frame = cur_animation.repeatto;
					}
					else
					{
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount)
						{
							this.animationFinish(true);
						}
						else
						{
							this.cur_frame = cur_animation.repeatto;
						}
					}
				}
			}
			if (this.cur_frame < 0)
				this.cur_frame = 0;
			else if (this.cur_frame >= cur_animation.frames.length)
				this.cur_frame = cur_animation.frames.length - 1;
			if (now > this.frameStart + ((cur_animation.frames[this.cur_frame].duration / this.cur_anim_speed) / (cur_timescale === 0 ? 0.000000001 : cur_timescale)))
			{
				this.frameStart = now;
			}
			next_frame = cur_animation.frames[this.cur_frame];
			this.OnFrameChanged(prev_frame, next_frame);
			this.runtime.redraw = true;
		}
	};
	instanceProto.doChangeAnim = function ()
	{
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var i, len, a, anim = null;
		for (i = 0, len = this.type.animations.length; i < len; i++)
		{
			a = this.type.animations[i];
			if (a.name.toLowerCase() === this.changeAnimName.toLowerCase())
			{
				anim = a;
				break;
			}
		}
		this.changeAnimName = "";
		if (!anim)
			return;
		if (anim.name.toLowerCase() === this.cur_animation.name.toLowerCase() && this.animPlaying)
			return;
		this.cur_animation = anim;
		this.cur_anim_speed = anim.speed;
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (this.changeAnimFrom === 1)
			this.cur_frame = 0;
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		this.animForwards = true;
		this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
		this.runtime.redraw = true;
	};
	instanceProto.doChangeAnimFrame = function ()
	{
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var prev_frame_number = this.cur_frame;
		this.cur_frame = cr.floor(this.changeAnimFrame);
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (prev_frame_number !== this.cur_frame)
		{
			this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
			this.frameStart = this.getNowTime();
			this.runtime.redraw = true;
		}
		this.changeAnimFrame = -1;
	};
	instanceProto.OnFrameChanged = function (prev_frame, next_frame)
	{
		var oldw = prev_frame.width;
		var oldh = prev_frame.height;
		var neww = next_frame.width;
		var newh = next_frame.height;
		if (oldw != neww)
			this.width *= (neww / oldw);
		if (oldh != newh)
			this.height *= (newh / oldh);
		this.hotspotX = next_frame.hotspotX;
		this.hotspotY = next_frame.hotspotY;
		this.collision_poly.set_pts(next_frame.poly_pts);
		this.set_bbox_changed();
		this.curFrame = next_frame;
		this.curWebGLTexture = next_frame.webGL_texture;
		var i, len, b;
		for (i = 0, len = this.behavior_insts.length; i < len; i++)
		{
			b = this.behavior_insts[i];
			if (b.onSpriteFrameChanged)
				b.onSpriteFrameChanged(prev_frame, next_frame);
		}
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnFrameChanged, this);
	};
	instanceProto.draw = function(ctx)
	{
		ctx.globalAlpha = this.opacity;
		var cur_frame = this.curFrame;
		var spritesheeted = cur_frame.spritesheeted;
		var cur_image = cur_frame.texture_img;
		var myx = this.x;
		var myy = this.y;
		var w = this.width;
		var h = this.height;
		if (this.angle === 0 && w >= 0 && h >= 0)
		{
			myx -= this.hotspotX * w;
			myy -= this.hotspotY * h;
			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}
			if (spritesheeted)
			{
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
										 myx, myy, w, h);
			}
			else
			{
				ctx.drawImage(cur_image, myx, myy, w, h);
			}
		}
		else
		{
			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}
			ctx.save();
			var widthfactor = w > 0 ? 1 : -1;
			var heightfactor = h > 0 ? 1 : -1;
			ctx.translate(myx, myy);
			if (widthfactor !== 1 || heightfactor !== 1)
				ctx.scale(widthfactor, heightfactor);
			ctx.rotate(this.angle * widthfactor * heightfactor);
			var drawx = 0 - (this.hotspotX * cr.abs(w))
			var drawy = 0 - (this.hotspotY * cr.abs(h));
			if (spritesheeted)
			{
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
										 drawx, drawy, cr.abs(w), cr.abs(h));
			}
			else
			{
				ctx.drawImage(cur_image, drawx, drawy, cr.abs(w), cr.abs(h));
			}
			ctx.restore();
		}
		/*
		ctx.strokeStyle = "#f00";
		ctx.lineWidth = 3;
		ctx.beginPath();
		this.collision_poly.cache_poly(this.width, this.height, this.angle);
		var i, len, ax, ay, bx, by;
		for (i = 0, len = this.collision_poly.pts_count; i < len; i++)
		{
			ax = this.collision_poly.pts_cache[i*2] + this.x;
			ay = this.collision_poly.pts_cache[i*2+1] + this.y;
			bx = this.collision_poly.pts_cache[((i+1)%len)*2] + this.x;
			by = this.collision_poly.pts_cache[((i+1)%len)*2+1] + this.y;
			ctx.moveTo(ax, ay);
			ctx.lineTo(bx, by);
		}
		ctx.stroke();
		ctx.closePath();
		*/
		/*
		if (this.behavior_insts.length >= 1 && this.behavior_insts[0].draw)
		{
			this.behavior_insts[0].draw(ctx);
		}
		*/
	};
	instanceProto.drawGL = function(glw)
	{
		glw.setTexture(this.curWebGLTexture);
		glw.setOpacity(this.opacity);
		var cur_frame = this.curFrame;
		var q = this.bquad;
		if (this.runtime.pixel_rounding)
		{
			var ox = ((this.x + 0.5) | 0) - this.x;
			var oy = ((this.y + 0.5) | 0) - this.y;
			if (cur_frame.spritesheeted)
				glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, cur_frame.sheetTex);
			else
				glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
		}
		else
		{
			if (cur_frame.spritesheeted)
				glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, cur_frame.sheetTex);
			else
				glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
		}
	};
	instanceProto.getImagePointIndexByName = function(name_)
	{
		var cur_frame = this.curFrame;
		var i, len;
		for (i = 0, len = cur_frame.image_points.length; i < len; i++)
		{
			if (name_.toLowerCase() === cur_frame.image_points[i][0].toLowerCase())
				return i;
		}
		return -1;
	};
	instanceProto.getImagePoint = function(imgpt, getX)
	{
		var cur_frame = this.curFrame;
		var image_points = cur_frame.image_points;
		var index;
		if (cr.is_string(imgpt))
			index = this.getImagePointIndexByName(imgpt);
		else
			index = imgpt - 1;	// 0 is origin
		index = cr.floor(index);
		if (index < 0 || index >= image_points.length)
			return getX ? this.x : this.y;	// return origin
		var x = (image_points[index][1] - cur_frame.hotspotX) * this.width;
		var y = image_points[index][2];
		y = (y - cur_frame.hotspotY) * this.height;
		var cosa = Math.cos(this.angle);
		var sina = Math.sin(this.angle);
		var x_temp = (x * cosa) - (y * sina);
		y = (y * cosa) + (x * sina);
		x = x_temp;
		x += this.x;
		y += this.y;
		return getX ? x : y;
	};
	function Cnds() {};
	function collmemory_add(collmemory, a, b)
	{
		collmemory.push([a, b]);
	};
	function collmemory_remove(collmemory, a, b)
	{
		var i, j = 0, len, entry;
		for (i = 0, len = collmemory.length; i < len; i++)
		{
			entry = collmemory[i];
			if (!((entry[0] === a && entry[1] === b) || (entry[0] === b && entry[1] === a)))
			{
				collmemory[j] = collmemory[i];
				j++;
			}
		}
		collmemory.length = j;
	};
	function collmemory_removeInstance(collmemory, inst)
	{
		var i, j = 0, len, entry;
		for (i = 0, len = collmemory.length; i < len; i++)
		{
			entry = collmemory[i];
			if (entry[0] !== inst && entry[1] !== inst)
			{
				collmemory[j] = collmemory[i];
				j++;
			}
		}
		collmemory.length = j;
	};
	function collmemory_has(collmemory, a, b)
	{
		var i, len, entry;
		for (i = 0, len = collmemory.length; i < len; i++)
		{
			entry = collmemory[i];
			if ((entry[0] === a && entry[1] === b) || (entry[0] === b && entry[1] === a))
				return true;
		}
		return false;
	};
	Cnds.prototype.OnCollision = function (rtype)
	{
		if (!rtype)
			return false;
		var runtime = this.runtime;
		var cnd = runtime.getCurrentCondition();
		var ltype = cnd.type;
		if (!cnd.extra.collmemory)
		{
			cnd.extra.collmemory = [];
			runtime.addDestroyCallback((function (collmemory) {
				return function(inst) {
					collmemory_removeInstance(collmemory, inst);
				};
			})(cnd.extra.collmemory));
		}
		var lsol = ltype.getCurrentSol();
		var rsol = rtype.getCurrentSol();
		var linstances = lsol.getObjects();
		var rinstances = rsol.getObjects();
		var l, lenl, linst, r, lenr, rinst;
		var curlsol, currsol;
		var current_event = runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		for (l = 0, lenl = linstances.length; l < lenl; l++)
		{
			linst = linstances[l];
			for (r = 0, lenr = rinstances.length; r < lenr; r++)
			{
				rinst = rinstances[r];
				if (runtime.testOverlap(linst, rinst) || runtime.checkRegisteredCollision(linst, rinst))
				{
					if (!collmemory_has(cnd.extra.collmemory, linst, rinst))
					{
						collmemory_add(cnd.extra.collmemory, linst, rinst);
						runtime.pushCopySol(current_event.solModifiers);
						curlsol = ltype.getCurrentSol();
						currsol = rtype.getCurrentSol();
						curlsol.select_all = false;
						currsol.select_all = false;
						if (ltype === rtype)
						{
							curlsol.instances.length = 2;	// just use lsol, is same reference as rsol
							curlsol.instances[0] = linst;
							curlsol.instances[1] = rinst;
						}
						else
						{
							curlsol.instances.length = 1;
							currsol.instances.length = 1;
							curlsol.instances[0] = linst;
							currsol.instances[0] = rinst;
						}
						current_event.retrigger();
						runtime.popSol(current_event.solModifiers);
					}
				}
				else
				{
					collmemory_remove(cnd.extra.collmemory, linst, rinst);
				}
			}
		}
		return false;
	};
	var rpicktype = null;
	var rtopick = new cr.ObjectSet();
	var needscollisionfinish = false;
	function DoOverlapCondition(rtype, offx, offy)
	{
		if (!rtype)
			return false;
		var do_offset = (offx !== 0 || offy !== 0);
		var oldx, oldy, ret = false, r, lenr, rinst;
		var cnd = this.runtime.getCurrentCondition();
		var ltype = cnd.type;
		var inverted = cnd.inverted;
		var rsol = rtype.getCurrentSol();
		var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
		var rinstances;
		if (rsol.select_all)
			rinstances = rsol.type.instances;
		else if (orblock)
			rinstances = rsol.else_instances;
		else
			rinstances = rsol.instances;
		rpicktype = rtype;
		needscollisionfinish = (ltype !== rtype && !inverted);
		if (do_offset)
		{
			oldx = this.x;
			oldy = this.y;
			this.x += offx;
			this.y += offy;
			this.set_bbox_changed();
		}
		for (r = 0, lenr = rinstances.length; r < lenr; r++)
		{
			rinst = rinstances[r];
			if (this.runtime.testOverlap(this, rinst))
			{
				ret = true;
				if (inverted)
					break;
				if (ltype !== rtype)
					rtopick.add(rinst);
			}
		}
		if (do_offset)
		{
			this.x = oldx;
			this.y = oldy;
			this.set_bbox_changed();
		}
		return ret;
	};
	typeProto.finish = function (do_pick)
	{
		if (!needscollisionfinish)
			return;
		if (do_pick)
		{
			var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
			var sol = rpicktype.getCurrentSol();
			var topick = rtopick.valuesRef();
			var i, len, inst;
			if (sol.select_all)
			{
				sol.select_all = false;
				sol.instances.length = topick.length;
				for (i = 0, len = topick.length; i < len; i++)
				{
					sol.instances[i] = topick[i];
				}
				if (orblock)
				{
					sol.else_instances.length = 0;
					for (i = 0, len = rpicktype.instances.length; i < len; i++)
					{
						inst = rpicktype.instances[i];
						if (!rtopick.contains(inst))
							sol.else_instances.push(inst);
					}
				}
			}
			else
			{
				var initsize = sol.instances.length;
				sol.instances.length = initsize + topick.length;
				for (i = 0, len = topick.length; i < len; i++)
				{
					sol.instances[initsize + i] = topick[i];
					if (orblock)
						cr.arrayFindRemove(sol.else_instances, topick[i]);
				}
			}
			rpicktype.applySolToContainer();
		}
		rtopick.clear();
		needscollisionfinish = false;
	};
	Cnds.prototype.IsOverlapping = function (rtype)
	{
		return DoOverlapCondition.call(this, rtype, 0, 0);
	};
	Cnds.prototype.IsOverlappingOffset = function (rtype, offx, offy)
	{
		return DoOverlapCondition.call(this, rtype, offx, offy);
	};
	Cnds.prototype.IsAnimPlaying = function (animname)
	{
		return this.cur_animation.name.toLowerCase() === animname.toLowerCase();
	};
	Cnds.prototype.CompareFrame = function (cmp, framenum)
	{
		return cr.do_cmp(this.cur_frame, cmp, framenum);
	};
	Cnds.prototype.OnAnimFinished = function (animname)
	{
		return this.animTriggerName.toLowerCase() === animname.toLowerCase();
	};
	Cnds.prototype.OnAnyAnimFinished = function ()
	{
		return true;
	};
	Cnds.prototype.OnFrameChanged = function ()
	{
		return true;
	};
	Cnds.prototype.IsMirrored = function ()
	{
		return this.width < 0;
	};
	Cnds.prototype.IsFlipped = function ()
	{
		return this.height < 0;
	};
	Cnds.prototype.OnURLLoaded = function ()
	{
		return true;
	};
	Cnds.prototype.IsCollisionEnabled = function ()
	{
		return this.collisionsEnabled;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Spawn = function (obj, layer, imgpt)
	{
		if (!obj || !layer)
			return;
		var inst = this.runtime.createInstance(obj, layer, this.getImagePoint(imgpt, true), this.getImagePoint(imgpt, false));
		if (!inst)
			return;
		inst.angle = this.angle;
		inst.set_bbox_changed();
		this.runtime.isInOnDestroy++;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		this.runtime.isInOnDestroy--;
		var cur_act = this.runtime.getCurrentAction();
		var reset_sol = false;
		if (cr.is_undefined(cur_act.extra.Spawn_LastExec) || cur_act.extra.Spawn_LastExec < this.runtime.execcount)
		{
			reset_sol = true;
			cur_act.extra.Spawn_LastExec = this.runtime.execcount;
		}
		var i, len, s, sol;
		if (obj != this.type)
		{
			sol = obj.getCurrentSol();
			sol.select_all = false;
			if (reset_sol)
			{
				sol.instances.length = 1;
				sol.instances[0] = inst;
			}
			else
				sol.instances.push(inst);
			if (inst.is_contained)
			{
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					s = inst.siblings[i];
					sol = s.type.getCurrentSol();
					sol.select_all = false;
					if (reset_sol)
					{
						sol.instances.length = 1;
						sol.instances[0] = s;
					}
					else
						sol.instances.push(s);
				}
			}
		}
	};
	Acts.prototype.SetEffect = function (effect)
	{
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	Acts.prototype.StopAnim = function ()
	{
		this.animPlaying = false;
	};
	Acts.prototype.StartAnim = function (from)
	{
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		if (from === 1 && this.cur_frame !== 0)
		{
			var prev_frame = this.cur_animation.frames[this.cur_frame];
			this.cur_frame = 0;
			this.OnFrameChanged(prev_frame, this.cur_animation.frames[0]);
			this.runtime.redraw = true;
		}
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
	};
	Acts.prototype.SetAnim = function (animname, from)
	{
		this.changeAnimName = animname;
		this.changeAnimFrom = from;
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (!this.inAnimTrigger)
			this.doChangeAnim();
	};
	Acts.prototype.SetAnimFrame = function (framenumber)
	{
		this.changeAnimFrame = framenumber;
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (!this.inAnimTrigger)
			this.doChangeAnimFrame();
	};
	Acts.prototype.SetAnimSpeed = function (s)
	{
		this.cur_anim_speed = cr.abs(s);
		this.animForwards = (s >= 0);
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
	};
	Acts.prototype.SetMirrored = function (m)
	{
		var neww = cr.abs(this.width) * (m === 0 ? -1 : 1);
		if (this.width === neww)
			return;
		this.width = neww;
		this.set_bbox_changed();
	};
	Acts.prototype.SetFlipped = function (f)
	{
		var newh = cr.abs(this.height) * (f === 0 ? -1 : 1);
		if (this.height === newh)
			return;
		this.height = newh;
		this.set_bbox_changed();
	};
	Acts.prototype.SetScale = function (s)
	{
		var cur_frame = this.curFrame;
		var mirror_factor = (this.width < 0 ? -1 : 1);
		var flip_factor = (this.height < 0 ? -1 : 1);
		var new_width = cur_frame.width * s * mirror_factor;
		var new_height = cur_frame.height * s * flip_factor;
		if (this.width !== new_width || this.height !== new_height)
		{
			this.width = new_width;
			this.height = new_height;
			this.set_bbox_changed();
		}
	};
	Acts.prototype.LoadURL = function (url_, resize_)
	{
		var img = new Image();
		var self = this;
		var curFrame_ = this.curFrame;
		img.onload = function ()
		{
			curFrame_.texture_img = img;
			curFrame_.offx = 0;
			curFrame_.offy = 0;
			curFrame_.width = img.width;
			curFrame_.height = img.height;
			curFrame_.spritesheeted = false;
			curFrame_.datauri = "";
			if (self.runtime.glwrap)
			{
				if (curFrame_.webGL_texture)
					self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);
				curFrame_.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
				if (self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
			}
			if (resize_ === 0)		// resize to image size
			{
				self.width = img.width;
				self.height = img.height;
				self.set_bbox_changed();
			}
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
		};
		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
		img.src = url_;
	};
	Acts.prototype.SetCollisions = function (set_)
	{
		this.collisionsEnabled = (set_ !== 0);
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.AnimationFrame = function (ret)
	{
		ret.set_int(this.cur_frame);
	};
	Exps.prototype.AnimationFrameCount = function (ret)
	{
		ret.set_int(this.cur_animation.frames.length);
	};
	Exps.prototype.AnimationName = function (ret)
	{
		ret.set_string(this.cur_animation.name);
	};
	Exps.prototype.AnimationSpeed = function (ret)
	{
		ret.set_float(this.cur_anim_speed);
	};
	Exps.prototype.ImagePointX = function (ret, imgpt)
	{
		ret.set_float(this.getImagePoint(imgpt, true));
	};
	Exps.prototype.ImagePointY = function (ret, imgpt)
	{
		ret.set_float(this.getImagePoint(imgpt, false));
	};
	Exps.prototype.ImagePointCount = function (ret)
	{
		ret.set_int(this.curFrame.image_points.length);
	};
	Exps.prototype.ImageWidth = function (ret)
	{
		ret.set_float(this.curFrame.width);
	};
	Exps.prototype.ImageHeight = function (ret)
	{
		ret.set_float(this.curFrame.height);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Text = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Text.prototype;
	pluginProto.onCreate = function ()
	{
		pluginProto.acts.SetWidth = function (w)
		{
			if (this.width !== w)
			{
				this.width = w;
				this.text_changed = true;	// also recalculate text wrapping
				this.set_bbox_changed();
			}
		};
	};
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			inst.mycanvas = null;
			inst.myctx = null;
			inst.mytex = null;
		}
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.lines = [];		// for word wrapping
		this.text_changed = true;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var requestedWebFonts = {};		// already requested web fonts have an entry here
	instanceProto.onCreate = function()
	{
		this.text = this.properties[0];
		this.visible = (this.properties[1] === 0);		// 0=visible, 1=invisible
		this.font = this.properties[2];
		this.color = this.properties[3];
		this.halign = this.properties[4];				// 0=left, 1=center, 2=right
		this.valign = this.properties[5];				// 0=top, 1=center, 2=bottom
		this.wrapbyword = (this.properties[7] === 0);	// 0=word, 1=character
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
		this.line_height_offset = this.properties[8];
		this.facename = "";
		this.fontstyle = "";
		var arr = this.font.split(" ");
		this.ptSize = 0;
		this.textWidth = 0;
		this.textHeight = 0;
		var i;
		for (i = 0; i < arr.length; i++)
		{
			if (arr[i].substr(arr[i].length - 2, 2) === "pt")
			{
				this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
				this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
				this.facename = arr[i + 1];
				if (i > 0)
					this.fontstyle = arr[i - 1];
				break;
			}
		}
		this.mycanvas = null;
		this.myctx = null;
		this.mytex = null;
		this.need_text_redraw = false;
		this.rcTex = new cr.rect(0, 0, 1, 1);
;
	};
	instanceProto.onDestroy = function ()
	{
		this.myctx = null;
		this.mycanvas = null;
		if (this.runtime.glwrap && this.mytex)
			this.runtime.glwrap.deleteTexture(this.mytex);
		this.mytex = null;
	};
	instanceProto.updateFont = function ()
	{
		this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
		this.text_changed = true;
		this.runtime.redraw = true;
	};
	instanceProto.draw = function(ctx, glmode)
	{
		ctx.font = this.font;
		ctx.textBaseline = "top";
		ctx.fillStyle = this.color;
		ctx.globalAlpha = glmode ? 1 : this.opacity;
		var myscale = 1;
		if (glmode)
		{
			myscale = this.layer.getScale();
			ctx.save();
			ctx.scale(myscale, myscale);
		}
		if (this.text_changed || this.width !== this.lastwrapwidth)
		{
			this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword);
			this.text_changed = false;
			this.lastwrapwidth = this.width;
		}
		this.update_bbox();
		var penX = glmode ? 0 : this.bquad.tlx;
		var penY = glmode ? 0 : this.bquad.tly;
		if (this.runtime.pixel_rounding)
		{
			penX = (penX + 0.5) | 0;
			penY = (penY + 0.5) | 0;
		}
		if (this.angle !== 0 && !glmode)
		{
			ctx.save();
			ctx.translate(penX, penY);
			ctx.rotate(this.angle);
			penX = 0;
			penY = 0;
		}
		var endY = penY + this.height;
		var line_height = this.pxHeight;
		line_height += (this.line_height_offset * this.runtime.devicePixelRatio);
		var drawX;
		var i;
		if (this.valign === 1)		// center
			penY += Math.max(this.height / 2 - (this.lines.length * line_height) / 2, 0);
		else if (this.valign === 2)	// bottom
			penY += Math.max(this.height - (this.lines.length * line_height) - 2, 0);
		for (i = 0; i < this.lines.length; i++)
		{
			drawX = penX;
			if (this.halign === 1)		// center
				drawX = penX + (this.width - this.lines[i].width) / 2;
			else if (this.halign === 2)	// right
				drawX = penX + (this.width - this.lines[i].width);
			ctx.fillText(this.lines[i].text, drawX, penY);
			penY += line_height;
			if (penY >= endY - line_height)
				break;
		}
		if (this.angle !== 0 || glmode)
			ctx.restore();
	};
	instanceProto.drawGL = function(glw)
	{
		if (this.width < 1 || this.height < 1)
			return;
		var need_redraw = this.text_changed || this.need_text_redraw;
		this.need_text_redraw = false;
		var layer_scale = this.layer.getScale();
		var layer_angle = this.layer.getAngle();
		var rcTex = this.rcTex;
		var floatscaledwidth = layer_scale * this.width;
		var floatscaledheight = layer_scale * this.height;
		var scaledwidth = Math.ceil(floatscaledwidth);
		var scaledheight = Math.ceil(floatscaledheight);
		var windowWidth = this.runtime.width;
		var windowHeight = this.runtime.height;
		var halfw = windowWidth / 2;
		var halfh = windowHeight / 2;
		if (!this.myctx)
		{
			this.mycanvas = document.createElement("canvas");
			this.mycanvas.width = scaledwidth;
			this.mycanvas.height = scaledheight;
			this.lastwidth = scaledwidth;
			this.lastheight = scaledheight;
			need_redraw = true;
			this.myctx = this.mycanvas.getContext("2d");
		}
		if (scaledwidth !== this.lastwidth || scaledheight !== this.lastheight)
		{
			this.mycanvas.width = scaledwidth;
			this.mycanvas.height = scaledheight;
			if (this.mytex)
			{
				glw.deleteTexture(this.mytex);
				this.mytex = null;
			}
			need_redraw = true;
		}
		if (need_redraw)
		{
			this.myctx.clearRect(0, 0, scaledwidth, scaledheight);
			this.draw(this.myctx, true);
			if (!this.mytex)
				this.mytex = glw.createEmptyTexture(scaledwidth, scaledheight, this.runtime.linearSampling, this.runtime.isMobile);
			glw.videoToTexture(this.mycanvas, this.mytex, this.runtime.isMobile);
		}
		this.lastwidth = scaledwidth;
		this.lastheight = scaledheight;
		glw.setTexture(this.mytex);
		glw.setOpacity(this.opacity);
		glw.resetModelView();
		glw.translate(-halfw, -halfh);
		glw.updateModelView();
		var q = this.bquad;
		var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true);
		var tly = this.layer.layerToCanvas(q.tlx, q.tly, false);
		var trx = this.layer.layerToCanvas(q.trx, q.try_, true);
		var try_ = this.layer.layerToCanvas(q.trx, q.try_, false);
		var brx = this.layer.layerToCanvas(q.brx, q.bry, true);
		var bry = this.layer.layerToCanvas(q.brx, q.bry, false);
		var blx = this.layer.layerToCanvas(q.blx, q.bly, true);
		var bly = this.layer.layerToCanvas(q.blx, q.bly, false);
		if (this.runtime.pixel_rounding || (this.angle === 0 && layer_angle === 0))
		{
			var ox = ((tlx + 0.5) | 0) - tlx;
			var oy = ((tly + 0.5) | 0) - tly
			tlx += ox;
			tly += oy;
			trx += ox;
			try_ += oy;
			brx += ox;
			bry += oy;
			blx += ox;
			bly += oy;
		}
		if (this.angle === 0 && layer_angle === 0)
		{
			trx = tlx + scaledwidth;
			try_ = tly;
			brx = trx;
			bry = tly + scaledheight;
			blx = tlx;
			bly = bry;
			rcTex.right = 1;
			rcTex.bottom = 1;
		}
		else
		{
			rcTex.right = floatscaledwidth / scaledwidth;
			rcTex.bottom = floatscaledheight / scaledheight;
		}
		glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);
		glw.resetModelView();
		glw.scale(layer_scale, layer_scale);
		glw.rotateZ(-this.layer.getAngle());
		glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
		glw.updateModelView();
	};
	var wordsCache = [];
	pluginProto.TokeniseWords = function (text)
	{
		wordsCache.length = 0;
		var cur_word = "";
		var ch;
		var i = 0;
		while (i < text.length)
		{
			ch = text.charAt(i);
			if (ch === "\n")
			{
				if (cur_word.length)
				{
					wordsCache.push(cur_word);
					cur_word = "";
				}
				wordsCache.push("\n");
				++i;
			}
			else if (ch === " " || ch === "\t" || ch === "-")
			{
				do {
					cur_word += text.charAt(i);
					i++;
				}
				while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));
				wordsCache.push(cur_word);
				cur_word = "";
			}
			else if (i < text.length)
			{
				cur_word += ch;
				i++;
			}
		}
		if (cur_word.length)
			wordsCache.push(cur_word);
	};
	pluginProto.WordWrap = function (text, lines, ctx, width, wrapbyword)
	{
		if (!text || !text.length)
		{
			lines.length = 0;
			return;
		}
		if (width <= 2.0)
		{
			lines.length = 0;
			return;
		}
		if (text.length <= 100 && text.indexOf("\n") === -1)
		{
			var all_width = 0;
			all_width = ctx.measureText(text).width;
			if (all_width <= width)
			{
				if (lines.length)
					lines.length = 1;
				else
					lines.push({});
				lines[0].text = text;
				lines[0].width = all_width;
				return;
			}
		}
		this.WrapText(text, lines, ctx, width, wrapbyword);
	};
	pluginProto.WrapText = function (text, lines, ctx, width, wrapbyword)
	{
		var wordArray;
		if (wrapbyword)
		{
			this.TokeniseWords(text);	// writes to wordsCache
			wordArray = wordsCache;
		}
		else
			wordArray = text;
		var cur_line = "";
		var prev_line;
		var line_width;
		var i;
		var lineIndex = 0;
		var line;
		for (i = 0; i < wordArray.length; i++)
		{
			if (wordArray[i] === "\n")
			{
				if (lineIndex >= lines.length)
					lines.push({});
				line = lines[lineIndex];
				line.text = cur_line;
				line.width = 0;
				line.width = ctx.measureText(cur_line).width;
				lineIndex++;
				cur_line = "";
				continue;
			}
			prev_line = cur_line;
			cur_line += wordArray[i];
			line_width = 0;
			line_width = ctx.measureText(cur_line).width;
			if (line_width >= width)
			{
				if (lineIndex >= lines.length)
					lines.push({});
				line = lines[lineIndex];
				line.text = prev_line;
				line.width = 0;
				line.width = ctx.measureText(prev_line).width;
				lineIndex++;
				cur_line = wordArray[i];
				if (!wrapbyword && cur_line === " ")
					cur_line = "";
			}
		}
		if (cur_line.length)
		{
			if (lineIndex >= lines.length)
				lines.push({});
			line = lines[lineIndex];
			line.text = cur_line;
			line.width = 0;
			line.width = ctx.measureText(cur_line).width;
			lineIndex++;
		}
		lines.length = lineIndex;
	};
	function Cnds() {};
	Cnds.prototype.CompareText = function(text_to_compare, case_sensitive)
	{
		if (case_sensitive)
			return this.text == text_to_compare;
		else
			return this.text.toLowerCase() == text_to_compare.toLowerCase();
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetText = function(param)
	{
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		var text_to_set = param.toString();
		if (this.text !== text_to_set)
		{
			this.text = text_to_set;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	Acts.prototype.AppendText = function(param)
	{
		if (cr.is_number(param))
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		var text_to_append = param.toString();
		if (text_to_append)	// not empty
		{
			this.text += text_to_append;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	Acts.prototype.SetFontFace = function (face_, style_)
	{
		var newstyle = "";
		switch (style_) {
		case 1: newstyle = "bold"; break;
		case 2: newstyle = "italic"; break;
		case 3: newstyle = "bold italic"; break;
		}
		if (face_ === this.facename && newstyle === this.fontstyle)
			return;		// no change
		this.facename = face_;
		this.fontstyle = newstyle;
		this.updateFont();
	};
	Acts.prototype.SetFontSize = function (size_)
	{
		if (this.ptSize === size_)
			return;
		this.ptSize = size_;
		this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
		this.updateFont();
	};
	Acts.prototype.SetFontColor = function (rgb)
	{
		var newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";
		if (newcolor === this.color)
			return;
		this.color = newcolor;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
	};
	Acts.prototype.SetWebFont = function (familyname_, cssurl_)
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");
			return;		// DC todo
		}
		var self = this;
		var refreshFunc = (function () {
							self.runtime.redraw = true;
							self.text_changed = true;
						});
		if (requestedWebFonts.hasOwnProperty(cssurl_))
		{
			var newfacename = "'" + familyname_ + "'";
			if (this.facename === newfacename)
				return;	// no change
			this.facename = newfacename;
			this.updateFont();
			for (var i = 1; i < 10; i++)
			{
				setTimeout(refreshFunc, i * 100);
				setTimeout(refreshFunc, i * 1000);
			}
			return;
		}
		var wf = document.createElement("link");
		wf.href = cssurl_;
		wf.rel = "stylesheet";
		wf.type = "text/css";
		wf.onload = refreshFunc;
		document.getElementsByTagName('head')[0].appendChild(wf);
		requestedWebFonts[cssurl_] = true;
		this.facename = "'" + familyname_ + "'";
		this.updateFont();
		for (var i = 1; i < 10; i++)
		{
			setTimeout(refreshFunc, i * 100);
			setTimeout(refreshFunc, i * 1000);
		}
;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.text);
	};
	Exps.prototype.FaceName = function (ret)
	{
		ret.set_string(this.facename);
	};
	Exps.prototype.FaceSize = function (ret)
	{
		ret.set_int(this.ptSize);
	};
	Exps.prototype.TextWidth = function (ret)
	{
		var w = 0;
		var i, len, x;
		for (i = 0, len = this.lines.length; i < len; i++)
		{
			x = this.lines[i].width;
			if (w < x)
				w = x;
		}
		ret.set_int(w);
	};
	Exps.prototype.TextHeight = function (ret)
	{
		ret.set_int(this.lines.length * this.pxHeight);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Touch = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Touch.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.touches = [];
		this.mouseDown = false;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var dummyoffset = {left: 0, top: 0};
	instanceProto.findTouch = function (id)
	{
		var i, len;
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			if (this.touches[i]["id"] === id)
				return i;
		}
		return -1;
	};
	var appmobi_accx = 0;
	var appmobi_accy = 0;
	var appmobi_accz = 0;
	function AppMobiGetAcceleration(evt)
	{
		appmobi_accx = evt.x;
		appmobi_accy = evt.y;
		appmobi_accz = evt.z;
	};
	var pg_accx = 0;
	var pg_accy = 0;
	var pg_accz = 0;
	function PhoneGapGetAcceleration(evt)
	{
		pg_accx = evt.x;
		pg_accy = evt.y;
		pg_accz = evt.z;
	};
	var theInstance = null;
	instanceProto.onCreate = function()
	{
		theInstance = this;
		this.isWindows8 = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.orient_alpha = 0;
		this.orient_beta = 0;
		this.orient_gamma = 0;
		this.acc_g_x = 0;
		this.acc_g_y = 0;
		this.acc_g_z = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.acc_z = 0;
		this.curTouchX = 0;
		this.curTouchY = 0;
		this.trigger_index = 0;
		this.trigger_id = 0;
		this.useMouseInput = (this.properties[0] !== 0);
		var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
		var elem2 = document;
		if (this.runtime.isDirectCanvas)
			elem2 = elem = window["Canvas"];
		else if (this.runtime.isCocoonJs)
			elem2 = elem = window;
		var self = this;
		if (window.navigator["msPointerEnabled"])
		{
			elem.addEventListener("MSPointerDown",
				function(info) {
					self.onPointerStart(info);
				},
				false
			);
			elem.addEventListener("MSPointerMove",
				function(info) {
					self.onPointerMove(info);
				},
				false
			);
			elem2.addEventListener("MSPointerUp",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			elem2.addEventListener("MSPointerCancel",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			if (this.runtime.canvas)
			{
				this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
				document.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
			}
		}
		else
		{
			elem.addEventListener("touchstart",
				function(info) {
					self.onTouchStart(info);
				},
				false
			);
			elem.addEventListener("touchmove",
				function(info) {
					self.onTouchMove(info);
				},
				false
			);
			elem2.addEventListener("touchend",
				function(info) {
					self.onTouchEnd(info);
				},
				false
			);
			elem2.addEventListener("touchcancel",
				function(info) {
					self.onTouchEnd(info);
				},
				false
			);
		}
		if (this.isWindows8)
		{
			var win8accelerometerFn = function(e) {
					var reading = e["reading"];
					self.acc_x = reading["accelerationX"];
					self.acc_y = reading["accelerationY"];
					self.acc_z = reading["accelerationZ"];
				};
			var win8inclinometerFn = function(e) {
					var reading = e["reading"];
					self.orient_alpha = reading["yawDegrees"];
					self.orient_beta = reading["pitchDegrees"];
					self.orient_gamma = reading["rollDegrees"];
				};
			var accelerometer = Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();
            if (accelerometer)
			{
                accelerometer["reportInterval"] = Math.max(accelerometer["minimumReportInterval"], 16);
				accelerometer.addEventListener("readingchanged", win8accelerometerFn);
            }
			var inclinometer = Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();
			if (inclinometer)
			{
				inclinometer["reportInterval"] = Math.max(inclinometer["minimumReportInterval"], 16);
				inclinometer.addEventListener("readingchanged", win8inclinometerFn);
			}
			document.addEventListener("visibilitychange", function(e) {
				if (document["hidden"] || document["msHidden"])
				{
					if (accelerometer)
						accelerometer.removeEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.removeEventListener("readingchanged", win8inclinometerFn);
				}
				else
				{
					if (accelerometer)
						accelerometer.addEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.addEventListener("readingchanged", win8inclinometerFn);
				}
			}, false);
		}
		else
		{
			window.addEventListener("deviceorientation", function (eventData) {
				self.orient_alpha = eventData["alpha"] || 0;
				self.orient_beta = eventData["beta"] || 0;
				self.orient_gamma = eventData["gamma"] || 0;
			}, false);
			window.addEventListener("devicemotion", function (eventData) {
				if (eventData["accelerationIncludingGravity"])
				{
					self.acc_g_x = eventData["accelerationIncludingGravity"]["x"];
					self.acc_g_y = eventData["accelerationIncludingGravity"]["y"];
					self.acc_g_z = eventData["accelerationIncludingGravity"]["z"];
				}
				if (eventData["acceleration"])
				{
					self.acc_x = eventData["acceleration"]["x"];
					self.acc_y = eventData["acceleration"]["y"];
					self.acc_z = eventData["acceleration"]["z"];
				}
			}, false);
		}
		if (this.useMouseInput && !this.runtime.isDomFree)
		{
			jQuery(document).mousemove(
				function(info) {
					self.onMouseMove(info);
				}
			);
			jQuery(document).mousedown(
				function(info) {
					self.onMouseDown(info);
				}
			);
			jQuery(document).mouseup(
				function(info) {
					self.onMouseUp(info);
				}
			);
		}
		if (this.runtime.isAppMobi && !this.runtime.isDirectCanvas)
		{
			AppMobi["accelerometer"]["watchAcceleration"](AppMobiGetAcceleration, { "frequency": 40, "adjustForRotation": true });
		}
		if (this.runtime.isPhoneGap)
		{
			navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, { "frequency": 40 });
		}
		this.runtime.tick2Me(this);
	};
	instanceProto.onPointerMove = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
		if (info.preventDefault)
			info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		var nowtime = cr.performance_now();
		if (i >= 0)
		{
			var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
			var t = this.touches[i];
			if (nowtime - t.time < 2)
				return;
			t.lasttime = t.time;
			t.lastx = t.x;
			t.lasty = t.y;
			t.time = nowtime;
			t.x = info.pageX - offset.left;
			t.y = info.pageY - offset.top;
		}
	};
	instanceProto.onPointerStart = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
		if (info.preventDefault)
			info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var touchx = info.pageX - offset.left;
		var touchy = info.pageY - offset.top;
		var nowtime = cr.performance_now();
		this.trigger_index = this.touches.length;
		this.trigger_id = info["pointerId"];
		this.touches.push({ time: nowtime,
							x: touchx,
							y: touchy,
							lasttime: nowtime,
							lastx: touchx,
							lasty: touchy,
							"id": info["pointerId"],
							startindex: this.trigger_index
						});
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
		this.curTouchX = touchx;
		this.curTouchY = touchy;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
	};
	instanceProto.onPointerEnd = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
		if (info.preventDefault)
			info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		this.trigger_index = (i >= 0 ? this.touches[i].startindex : -1);
		this.trigger_id = (i >= 0 ? this.touches[i]["id"] : -1);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
		if (i >= 0)
		{
			this.touches.splice(i, 1);
		}
	};
	instanceProto.onTouchMove = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		var nowtime = cr.performance_now();
		var i, len, t, u;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			var j = this.findTouch(t["identifier"]);
			if (j >= 0)
			{
				var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
				u = this.touches[j];
				if (nowtime - u.time < 2)
					continue;
				u.lasttime = u.time;
				u.lastx = u.x;
				u.lasty = u.y;
				u.time = nowtime;
				u.x = t.pageX - offset.left;
				u.y = t.pageY - offset.top;
			}
		}
	};
	instanceProto.onTouchStart = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var nowtime = cr.performance_now();
		var i, len, t;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			this.trigger_index = this.touches.length;
			this.trigger_id = t["identifier"];
			this.touches.push({ time: nowtime,
								x: touchx,
								y: touchy,
								lasttime: nowtime,
								lastx: touchx,
								lasty: touchy,
								"id": t["identifier"],
								startindex: this.trigger_index
							});
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
			this.curTouchX = touchx;
			this.curTouchY = touchy;
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
		}
	};
	instanceProto.onTouchEnd = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		var i, len, t;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			var j = this.findTouch(t["identifier"]);
			this.trigger_index = (j >= 0 ? this.touches[j].startindex : -1);
			this.trigger_id = (j >= 0 ? this.touches[j]["id"] : -1);
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
			if (j >= 0)
			{
				this.touches.splice(j, 1);
			}
		}
	};
	instanceProto.getAlpha = function ()
	{
		if (this.runtime.isAppMobi && this.orient_alpha === 0 && appmobi_accz !== 0)
			return appmobi_accz * 90;
		else if (this.runtime.isPhoneGap  && this.orient_alpha === 0 && pg_accz !== 0)
			return pg_accz * 90;
		else
			return this.orient_alpha;
	};
	instanceProto.getBeta = function ()
	{
		if (this.runtime.isAppMobi && this.orient_beta === 0 && appmobi_accy !== 0)
			return appmobi_accy * -90;
		else if (this.runtime.isPhoneGap  && this.orient_beta === 0 && pg_accy !== 0)
			return pg_accy * -90;
		else
			return this.orient_beta;
	};
	instanceProto.getGamma = function ()
	{
		if (this.runtime.isAppMobi && this.orient_gamma === 0 && appmobi_accx !== 0)
			return appmobi_accx * 90;
		else if (this.runtime.isPhoneGap  && this.orient_gamma === 0 && pg_accx !== 0)
			return pg_accx * 90;
		else
			return this.orient_gamma;
	};
	var noop_func = function(){};
	instanceProto.onMouseDown = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchStart(fakeinfo);
		this.mouseDown = true;
	};
	instanceProto.onMouseMove = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		if (!this.mouseDown)
			return;
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchMove(fakeinfo);
	};
	instanceProto.onMouseUp = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		this.runtime.had_a_click = true;
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchEnd(fakeinfo);
		this.mouseDown = false;
	};
	instanceProto.tick2 = function()
	{
		var i, len, t;
		var nowtime = cr.performance_now();
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			t = this.touches[i];
			if (t.time <= nowtime - 50)
				t.lasttime = nowtime;
		}
	};
	function Cnds() {};
	Cnds.prototype.OnTouchStart = function ()
	{
		return true;
	};
	Cnds.prototype.OnTouchEnd = function ()
	{
		return true;
	};
	Cnds.prototype.IsInTouch = function ()
	{
		return this.touches.length;
	};
	Cnds.prototype.OnTouchObject = function (type)
	{
		if (!type)
			return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	Cnds.prototype.IsTouchingObject = function (type)
	{
		if (!type)
			return false;
		var sol = type.getCurrentSol();
		var instances = sol.getObjects();
		var px, py;
		var touching = [];
		var i, leni, j, lenj;
		for (i = 0, leni = instances.length; i < leni; i++)
		{
			var inst = instances[i];
			inst.update_bbox();
			for (j = 0, lenj = this.touches.length; j < lenj; j++)
			{
				var touch = this.touches[j];
				px = inst.layer.canvasToLayer(touch.x, touch.y, true);
				py = inst.layer.canvasToLayer(touch.x, touch.y, false);
				if (inst.contains_pt(px, py))
				{
					touching.push(inst);
					break;
				}
			}
		}
		if (touching.length)
		{
			sol.select_all = false;
			sol.instances = touching;
			return true;
		}
		else
			return false;
	};
	Cnds.prototype.CompareTouchSpeed = function (index, cmp, s)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
			return false;
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		var speed = 0;
		if (timediff > 0)
			speed = dist / timediff;
		return cr.do_cmp(speed, cmp, s);
	};
	Cnds.prototype.OrientationSupported = function ()
	{
		return typeof window["DeviceOrientationEvent"] !== "undefined";
	};
	Cnds.prototype.MotionSupported = function ()
	{
		return typeof window["DeviceMotionEvent"] !== "undefined";
	};
	Cnds.prototype.CompareOrientation = function (orientation_, cmp_, angle_)
	{
		var v = 0;
		if (orientation_ === 0)
			v = this.getAlpha();
		else if (orientation_ === 1)
			v = this.getBeta();
		else
			v = this.getGamma();
		return cr.do_cmp(v, cmp_, angle_);
	};
	Cnds.prototype.CompareAcceleration = function (acceleration_, cmp_, angle_)
	{
		var v = 0;
		if (acceleration_ === 0)
			v = this.acc_g_x;
		else if (acceleration_ === 1)
			v = this.acc_g_y;
		else if (acceleration_ === 2)
			v = this.acc_g_z;
		else if (acceleration_ === 3)
			v = this.acc_x;
		else if (acceleration_ === 4)
			v = this.acc_y;
		else if (acceleration_ === 5)
			v = this.acc_z;
		return cr.do_cmp(v, cmp_, angle_);
	};
	Cnds.prototype.OnNthTouchStart = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	Cnds.prototype.OnNthTouchEnd = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	Cnds.prototype.HasNthTouch = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return this.touches.length >= touch_ + 1;
	};
	pluginProto.cnds = new Cnds();
	function Exps() {};
	Exps.prototype.TouchCount = function (ret)
	{
		ret.set_int(this.touches.length);
	};
	Exps.prototype.X = function (ret, layerparam)
	{
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
			if (cr.is_undefined(layerparam))
			{
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxX = layer.parallaxX;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxX = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true));
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxX = oldParallaxX;
				layer.angle = oldAngle;
			}
			else
			{
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else
					layer = this.runtime.getLayerByName(layerparam);
				if (layer)
					ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true));
				else
					ret.set_float(0);
			}
		}
		else
			ret.set_float(0);
	};
	Exps.prototype.XAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.XForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.Y = function (ret, layerparam)
	{
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
			if (cr.is_undefined(layerparam))
			{
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxY = layer.parallaxY;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxY = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxY = oldParallaxY;
				layer.angle = oldAngle;
			}
			else
			{
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else
					layer = this.runtime.getLayerByName(layerparam);
				if (layer)
					ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
				else
					ret.set_float(0);
			}
		}
		else
			ret.set_float(0);
	};
	Exps.prototype.YAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.YForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.AbsoluteX = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].x);
		else
			ret.set_float(0);
	};
	Exps.prototype.AbsoluteXAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		ret.set_float(this.touches[index].x);
	};
	Exps.prototype.AbsoluteXForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.x);
	};
	Exps.prototype.AbsoluteY = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].y);
		else
			ret.set_float(0);
	};
	Exps.prototype.AbsoluteYAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		ret.set_float(this.touches[index].y);
	};
	Exps.prototype.AbsoluteYForID = function (ret, index)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.y);
	};
	Exps.prototype.SpeedAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	Exps.prototype.SpeedForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var dist = cr.distanceTo(touch.x, touch.y, touch.lastx, touch.lasty);
		var timediff = (touch.time - touch.lasttime) / 1000;
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	Exps.prototype.AngleAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var t = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y)));
	};
	Exps.prototype.AngleForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(touch.lastx, touch.lasty, touch.x, touch.y)));
	};
	Exps.prototype.Alpha = function (ret)
	{
		ret.set_float(this.getAlpha());
	};
	Exps.prototype.Beta = function (ret)
	{
		ret.set_float(this.getBeta());
	};
	Exps.prototype.Gamma = function (ret)
	{
		ret.set_float(this.getGamma());
	};
	Exps.prototype.AccelerationXWithG = function (ret)
	{
		ret.set_float(this.acc_g_x);
	};
	Exps.prototype.AccelerationYWithG = function (ret)
	{
		ret.set_float(this.acc_g_y);
	};
	Exps.prototype.AccelerationZWithG = function (ret)
	{
		ret.set_float(this.acc_g_z);
	};
	Exps.prototype.AccelerationX = function (ret)
	{
		ret.set_float(this.acc_x);
	};
	Exps.prototype.AccelerationY = function (ret)
	{
		ret.set_float(this.acc_y);
	};
	Exps.prototype.AccelerationZ = function (ret)
	{
		ret.set_float(this.acc_z);
	};
	Exps.prototype.TouchIndex = function (ret)
	{
		ret.set_int(this.trigger_index);
	};
	Exps.prototype.TouchID = function (ret)
	{
		ret.set_float(this.trigger_id);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.WebStorage = function(runtime)
{
	this.runtime = runtime;
};
(function()
{
	var pluginProto = cr.plugins_.WebStorage.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var prefix = "";
	var is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
	if (is_arcade)
		prefix = "arcade" + window["scirra_arcade_id"];
	var logged_sessionnotsupported = false;
	function LogSessionNotSupported()
	{
		if (logged_sessionnotsupported)
			return;
		cr.logexport("[Construct 2] Webstorage plugin: session storage is not supported on this platform. Try using local storage or global variables instead.");
		logged_sessionnotsupported = true;
	};
	instanceProto.onCreate = function()
	{
	};
	function Cnds() {};
	Cnds.prototype.LocalStorageEnabled = function()
	{
		return true;
	};
	Cnds.prototype.SessionStorageEnabled = function()
	{
		return true;
	};
	Cnds.prototype.LocalStorageExists = function(key)
	{
		return localStorage.getItem(prefix + key) != null;
	};
	Cnds.prototype.SessionStorageExists = function(key)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			return false;
		}
		return sessionStorage.getItem(prefix + key) != null;
	};
	Cnds.prototype.OnQuotaExceeded = function ()
	{
		return true;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.StoreLocal = function(key, data)
	{
		try {
			localStorage.setItem(prefix + key, data);
		}
		catch (e)
		{
			this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
		}
	};
	Acts.prototype.StoreSession = function(key,data)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			return;
		}
		try {
			sessionStorage.setItem(prefix + key, data);
		}
		catch (e)
		{
			this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
		}
	};
	Acts.prototype.RemoveLocal = function(key)
	{
		localStorage.removeItem(prefix + key);
	};
	Acts.prototype.RemoveSession = function(key)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			return;
		}
		sessionStorage.removeItem(prefix + key);
	};
	Acts.prototype.ClearLocal = function()
	{
		if (!is_arcade)
			localStorage.clear();
	};
	Acts.prototype.ClearSession = function()
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			return;
		}
		if (!is_arcade)
			sessionStorage.clear();
	};
	Acts.prototype.JSONLoad = function (json_, mode_)
	{
		var d;
		try {
			d = JSON.parse(json_);
		}
		catch(e) { return; }
		if (!d["c2dictionary"])			// presumably not a c2dictionary object
			return;
		var o = d["data"];
		if (mode_ === 0 && !is_arcade)	// 'set' mode: must clear webstorage first
			localStorage.clear();
		var p;
		for (p in o)
		{
			if (o.hasOwnProperty(p))
			{
				try {
					localStorage.setItem(prefix + p, o[p]);
				}
				catch (e)
				{
					this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
					return;
				}
			}
		}
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.LocalValue = function(ret,key)
	{
		ret.set_string(localStorage.getItem(prefix + key) || "");
	};
	Exps.prototype.SessionValue = function(ret,key)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			ret.set_string("");
			return;
		}
		ret.set_string(sessionStorage.getItem(prefix + key) || "");
	};
	Exps.prototype.LocalCount = function(ret)
	{
		ret.set_int(is_arcade ? 0 : localStorage.length);
	};
	Exps.prototype.SessionCount = function(ret)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			ret.set_int(0);
			return;
		}
		ret.set_int(is_arcade ? 0 : sessionStorage.length);
	};
	Exps.prototype.LocalAt = function(ret,n)
	{
		if (is_arcade)
			ret.set_string("");
		else
			ret.set_string(localStorage.getItem(localStorage.key(n)) || "");
	};
	Exps.prototype.SessionAt = function(ret,n)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			ret.set_string("");
			return;
		}
		if (is_arcade)
			ret.set_string("");
		else
			ret.set_string(sessionStorage.getItem(sessionStorage.key(n)) || "");
	};
	Exps.prototype.LocalKeyAt = function(ret,n)
	{
		if (is_arcade)
			ret.set_string("");
		else
			ret.set_string(localStorage.key(n));
	};
	Exps.prototype.SessionKeyAt = function(ret,n)
	{
		if (this.runtime.isCocoonJs || !sessionStorage)
		{
			LogSessionNotSupported();
			ret.set_string("");
			return;
		}
		if (is_arcade)
			ret.set_string("");
		else
			ret.set_string(sessionStorage.key(n));
	};
	Exps.prototype.AsJSON = function (ret)
	{
		var o = {}, i, len, k;
		for (i = 0, len = localStorage.length; i < len; i++)
		{
			k = localStorage.key(i);
			if (is_arcade)
			{
				if (k.substr(0, prefix.length) === prefix)
				{
					o[k.substr(prefix.length)] = localStorage.getItem(k);
				}
			}
			else
				o[k] = localStorage.getItem(k);
		}
		ret.set_string(JSON.stringify({
			"c2dictionary": true,
			"data": o
		}));
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.behaviors.Anchor = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Anchor.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.anch_left = this.properties[0];		// 0 = left, 1 = right
		this.anch_top = this.properties[1];			// 0 = top, 1 = bottom
		this.anch_right = this.properties[2];		// 0 = none, 1 = right
		this.anch_bottom = this.properties[3];		// 0 = none, 1 = bottom
		this.inst.update_bbox();
		this.xleft = this.inst.bbox.left;
		this.ytop = this.inst.bbox.top;
		this.xright = this.runtime.original_width - this.inst.bbox.left;
		this.ybottom = this.runtime.original_height - this.inst.bbox.top;
		this.rdiff = this.runtime.original_width - this.inst.bbox.right;
		this.bdiff = this.runtime.original_height - this.inst.bbox.bottom;
		this.enabled = true;
	};
	behinstProto.tick = function ()
	{
		if (!this.enabled)
			return;
		var n;
		var layer = this.inst.layer;
		var inst = this.inst;
		var bbox = this.inst.bbox;
		if (this.anch_left === 0)
		{
			inst.update_bbox();
			n = (layer.viewLeft + this.xleft) - bbox.left;
			if (n !== 0)
			{
				inst.x += n;
				inst.set_bbox_changed();
			}
		}
		else if (this.anch_left === 1)
		{
			inst.update_bbox();
			n = (layer.viewRight - this.xright) - bbox.left;
			if (n !== 0)
			{
				inst.x += n;
				inst.set_bbox_changed();
			}
		}
		if (this.anch_top === 0)
		{
			inst.update_bbox();
			n = (layer.viewTop + this.ytop) - bbox.top;
			if (n !== 0)
			{
				inst.y += n;
				inst.set_bbox_changed();
			}
		}
		else if (this.anch_top === 1)
		{
			inst.update_bbox();
			n = (layer.viewBottom - this.ybottom) - bbox.top;
			if (n !== 0)
			{
				inst.y += n;
				inst.set_bbox_changed();
			}
		}
		if (this.anch_right === 1)
		{
			inst.update_bbox();
			n = (layer.viewRight - this.rdiff) - bbox.right;
			if (n !== 0)
			{
				inst.width += n;
				if (inst.width < 0)
					inst.width = 0;
				inst.set_bbox_changed();
			}
		}
		if (this.anch_bottom === 1)
		{
			inst.update_bbox();
			n = (layer.viewBottom - this.bdiff) - bbox.bottom;
			if (n !== 0)
			{
				inst.height += n;
				if (inst.height < 0)
					inst.height = 0;
				inst.set_bbox_changed();
			}
		}
	};
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetEnabled = function (e)
	{
		this.enabled = (e !== 0);
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Bullet = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Bullet.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		var speed = this.properties[0];
		this.acc = this.properties[1];
		this.g = this.properties[2];
		this.bounceOffSolid = (this.properties[3] !== 0);
		this.setAngle = (this.properties[4] !== 0);
		this.dx = Math.cos(this.inst.angle) * speed;
		this.dy = Math.sin(this.inst.angle) * speed;
		this.lastx = this.inst.x;
		this.lasty = this.inst.y;
		this.lastKnownAngle = this.inst.angle;
		this.travelled = 0;
		this.enabled = true;
	};
	behinstProto.tick = function ()
	{
		if (!this.enabled)
			return;
		var dt = this.runtime.getDt(this.inst);
		var s, a;
		var bounceSolid, bounceAngle;
		if (this.inst.angle !== this.lastKnownAngle)
		{
			if (this.setAngle)
			{
				s = cr.distanceTo(0, 0, this.dx, this.dy);
				this.dx = Math.cos(this.inst.angle) * s;
				this.dy = Math.sin(this.inst.angle) * s;
			}
			this.lastKnownAngle = this.inst.angle;
		}
		if (this.acc !== 0)
		{
			s = cr.distanceTo(0, 0, this.dx, this.dy);
			if (this.dx === 0 && this.dy === 0)
				a = this.inst.angle;
			else
				a = cr.angleTo(0, 0, this.dx, this.dy);
			s += this.acc * dt;
			if (s < 0)
				s = 0;
			this.dx = Math.cos(a) * s;
			this.dy = Math.sin(a) * s;
		}
		if (this.g !== 0)
			this.dy += this.g * dt;
		this.lastx = this.inst.x;
		this.lasty = this.inst.y;
		if (this.dx !== 0 || this.dy !== 0)
		{
			this.inst.x += this.dx * dt;
			this.inst.y += this.dy * dt;
			this.travelled += cr.distanceTo(0, 0, this.dx * dt, this.dy * dt)
			if (this.setAngle)
			{
				this.inst.angle = cr.angleTo(0, 0, this.dx, this.dy);
				this.inst.set_bbox_changed();
				this.lastKnownAngle = this.inst.angle;
			}
			this.inst.set_bbox_changed();
			if (this.bounceOffSolid)
			{
				bounceSolid = this.runtime.testOverlapSolid(this.inst);
				if (bounceSolid)
				{
					this.runtime.registerCollision(this.inst, bounceSolid);
					s = cr.distanceTo(0, 0, this.dx, this.dy);
					bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty);
					this.dx = Math.cos(bounceAngle) * s;
					this.dy = Math.sin(bounceAngle) * s;
					this.inst.x += this.dx * dt;			// move out for one tick since the object can't have spent a tick in the solid
					this.inst.y += this.dy * dt;
					this.inst.set_bbox_changed();
					if (this.setAngle)
					{
						this.inst.angle = bounceAngle;
						this.lastKnownAngle = bounceAngle;
						this.inst.set_bbox_changed();
					}
					if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30)))
						this.runtime.pushOutSolidNearest(this.inst, 100);
				}
			}
		}
	};
	function Cnds() {};
	Cnds.prototype.CompareSpeed = function (cmp, s)
	{
		return cr.do_cmp(cr.distanceTo(0, 0, this.dx, this.dy), cmp, s);
	};
	Cnds.prototype.CompareTravelled = function (cmp, d)
	{
		return cr.do_cmp(this.travelled, cmp, d);
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetSpeed = function (s)
	{
		var a = cr.angleTo(0, 0, this.dx, this.dy);
		this.dx = Math.cos(a) * s;
		this.dy = Math.sin(a) * s;
	};
	Acts.prototype.SetAcceleration = function (a)
	{
		this.acc = a;
	};
	Acts.prototype.SetGravity = function (g)
	{
		this.g = g;
	};
	Acts.prototype.SetAngleOfMotion = function (a)
	{
		a = cr.to_radians(a);
		var s = cr.distanceTo(0, 0, this.dx, this.dy)
		this.dx = Math.cos(a) * s;
		this.dy = Math.sin(a) * s;
	};
	Acts.prototype.Bounce = function (objtype)
	{
		if (!objtype)
			return;
		var otherinst = objtype.getFirstPicked();
		if (!otherinst)
			return;
		var dt = this.runtime.getDt(this.inst);
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		var bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty, otherinst);
		this.dx = Math.cos(bounceAngle) * s;
		this.dy = Math.sin(bounceAngle) * s;
		this.inst.x += this.dx * dt;			// move out for one tick since the object can't have spent a tick in the solid
		this.inst.y += this.dy * dt;
		this.inst.set_bbox_changed();
		if (this.setAngle)
		{
			this.inst.angle = bounceAngle;
			this.lastKnownAngle = bounceAngle;
			this.inst.set_bbox_changed();
		}
		if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30)))
			this.runtime.pushOutSolidNearest(this.inst, 100);
	};
	Acts.prototype.SetEnabled = function (en)
	{
		this.enabled = (en === 1);
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Speed = function (ret)
	{
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		s = cr.round6dp(s);
		ret.set_float(s);
	};
	Exps.prototype.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
	Exps.prototype.AngleOfMotion = function (ret)
	{
		ret.set_float(cr.to_degrees(cr.angleTo(0, 0, this.dx, this.dy)));
	};
	Exps.prototype.DistanceTravelled = function (ret)
	{
		ret.set_float(this.travelled);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Fade = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Fade.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		var active_at_start = this.properties[0] === 1;
		this.fadeInTime = this.properties[1];
		this.waitTime = this.properties[2];
		this.fadeOutTime = this.properties[3];
		this.destroy = this.properties[4];			// 0 = no, 1 = after fade out
		this.stage = active_at_start ? 0 : 3;		// 0 = fade in, 1 = wait, 2 = fade out, 3 = done
		this.stageTime = new cr.KahanAdder();
		this.maxOpacity = (this.inst.opacity ? this.inst.opacity : 1.0);
		if (active_at_start)
		{
			if (this.fadeInTime === 0)
			{
				this.stage = 1;
				if (this.waitTime === 0)
					this.stage = 2;
			}
			else
			{
				this.inst.opacity = 0;
				this.runtime.redraw = true;
			}
		}
	};
	behinstProto.tick = function ()
	{
		this.stageTime.add(this.runtime.getDt(this.inst));
		if (this.stage === 0)
		{
			this.inst.opacity = (this.stageTime.sum / this.fadeInTime) * this.maxOpacity;
			this.runtime.redraw = true;
			if (this.inst.opacity >= this.maxOpacity)
			{
				this.inst.opacity = this.maxOpacity;
				this.stage = 1;	// wait stage
				this.stageTime.reset();
			}
		}
		if (this.stage === 1)
		{
			if (this.stageTime.sum >= this.waitTime)
			{
				this.stage = 2;	// fade out stage
				this.stageTime.reset();
			}
		}
		if (this.stage === 2)
		{
			if (this.fadeOutTime !== 0)
			{
				this.inst.opacity = this.maxOpacity - ((this.stageTime.sum / this.fadeOutTime) * this.maxOpacity);
				this.runtime.redraw = true;
				if (this.inst.opacity < 0)
				{
					this.inst.opacity = 0;
					this.stage = 3;	// done
					this.stageTime.reset();
					this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnFadeOutEnd, this.inst);
					if (this.destroy === 1)
						this.runtime.DestroyInstance(this.inst);
				}
			}
		}
	};
	behinstProto.doStart = function ()
	{
		this.stage = 0;
		this.stageTime.reset();
		if (this.fadeInTime === 0)
		{
			this.stage = 1;
			if (this.waitTime === 0)
				this.stage = 2;
		}
		else
		{
			this.inst.opacity = 0;
			this.runtime.redraw = true;
		}
	};
	function Cnds() {};
	Cnds.prototype.OnFadeOutEnd = function ()
	{
		return true;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.StartFade = function ()
	{
		if (this.stage === 3)
			this.doStart();
	};
	Acts.prototype.RestartFade = function ()
	{
		this.doStart();
	};
	behaviorProto.acts = new Acts();
}());
var Box2D = {};
Box2D.Collision = {};
Box2D.Collision.b2Collision = {};
Box2D.Collision.b2Distance = {};
Box2D.Collision.Shapes = {};
Box2D.Common = {};
Box2D.Common.b2Settings = {};
Box2D.Common.Math = {};
Box2D.Common.Math.b2Math = {};
Box2D.Consts = {};
Box2D.Dynamics = {};
Box2D.Dynamics.Contacts = {};
Box2D.Dynamics.Controllers = {};
Box2D.Dynamics.Joints = {};
function c2inherit(derived, base)
{
	for (var i in base.prototype)
	{
		if (base.prototype.hasOwnProperty(i))
			derived.prototype[i] = base.prototype[i];
	}
};
/**
 * Creates a callback function
 * @param {!Object} context The context ('this' variable) of the callback function
 * @param {function(...[*])} fn The function to execute with the given context for the returned callback
 * @return {function()} The callback function
 */
Box2D.generateCallback = function(context, fn) {
    return function() {
        fn.apply(context, arguments);
    };
};
/**
 * @type {number}
 * @const
 */
Box2D.Consts.MIN_VALUE_SQUARED = Number.MIN_VALUE * Number.MIN_VALUE;
/**
 * @param {number} friction1
 * @param {number} friction2
 */
Box2D.Common.b2Settings.b2MixFriction = function (friction1, friction2) {
    return Math.sqrt(friction1 * friction2);
};
/**
 * @param {number} restitution1
 * @param {number} restitution2
 */
Box2D.Common.b2Settings.b2MixRestitution = function (restitution1, restitution2) {
    return restitution1 > restitution2 ? restitution1 : restitution2;
};
Box2D.Common.b2Settings.VERSION = "2.1alpha-illandril";
Box2D.Common.b2Settings.USHRT_MAX = 0x0000ffff;
Box2D.Common.b2Settings.b2_maxManifoldPoints = 2;
Box2D.Common.b2Settings.b2_aabbExtension = 0.1;
Box2D.Common.b2Settings.b2_aabbMultiplier = 2.0;
Box2D.Common.b2Settings.b2_polygonRadius = 2.0 * Box2D.Common.b2Settings.b2_linearSlop;
Box2D.Common.b2Settings.b2_linearSlop = 0.005;
Box2D.Common.b2Settings.b2_angularSlop = 2.0 / 180.0 * Math.PI;
Box2D.Common.b2Settings.b2_toiSlop = 8.0 * Box2D.Common.b2Settings.b2_linearSlop;
Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland = 32;
Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland = 32;
Box2D.Common.b2Settings.b2_velocityThreshold = 1.0;
Box2D.Common.b2Settings.b2_maxLinearCorrection = 0.2;
Box2D.Common.b2Settings.b2_maxAngularCorrection = 8.0 / 180.0 * Math.PI;
Box2D.Common.b2Settings.b2_maxTranslation = 2.0;
Box2D.Common.b2Settings.b2_maxTranslationSquared = Box2D.Common.b2Settings.b2_maxTranslation * Box2D.Common.b2Settings.b2_maxTranslation;
Box2D.Common.b2Settings.b2_maxRotation = 0.5 * Math.PI;
Box2D.Common.b2Settings.b2_maxRotationSquared = Box2D.Common.b2Settings.b2_maxRotation * Box2D.Common.b2Settings.b2_maxRotation;
Box2D.Common.b2Settings.b2_contactBaumgarte = 0.2;
Box2D.Common.b2Settings.b2_timeToSleep = 0.5;
Box2D.Common.b2Settings.b2_linearSleepTolerance = 0.01;
Box2D.Common.b2Settings.b2_linearSleepToleranceSquared = Box2D.Common.b2Settings.b2_linearSleepTolerance * Box2D.Common.b2Settings.b2_linearSleepTolerance;
Box2D.Common.b2Settings.b2_angularSleepTolerance = 2.0 / 180.0 * Math.PI;
Box2D.Common.b2Settings.b2_angularSleepToleranceSquared = Box2D.Common.b2Settings.b2_angularSleepTolerance * Box2D.Common.b2Settings.b2_angularSleepTolerance;
Box2D.Common.b2Settings.MIN_VALUE_SQUARED = Number.MIN_VALUE * Number.MIN_VALUE;
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {number}
 */
Box2D.Common.Math.b2Math.Dot = function (a, b) {
  return a.x * b.x + a.y * b.y;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {number}
 */
Box2D.Common.Math.b2Math.CrossVV = function (a, b) {
  return a.x * b.y - a.y * b.x;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {number} s
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.CrossVF = function (a, s) {
  return Box2D.Common.Math.b2Vec2.Get(s * a.y, (-s * a.x));
};
/**
 * @param {number} s
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.CrossFV = function (s, a) {
  return Box2D.Common.Math.b2Vec2.Get((-s * a.y), s * a.x);
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Vec2} v
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulMV = function (A, v) {
  return Box2D.Common.Math.b2Vec2.Get(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Vec2} v
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulTMV = function (A, v) {
  return Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(v, A.col1), Box2D.Common.Math.b2Math.Dot(v, A.col2));
};
/**
 * @param {!Box2D.Common.Math.b2Transform} T
 * @param {!Box2D.Common.Math.b2Vec2} v
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulX = function (T, v) {
  var a = Box2D.Common.Math.b2Math.MulMV(T.R, v);
  a.x += T.position.x;
  a.y += T.position.y;
  return a;
};
/**
 * @param {!Box2D.Common.Math.b2Transform} T
 * @param {!Box2D.Common.Math.b2Vec2} v
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulXT = function (T, v) {
  var a = Box2D.Common.Math.b2Math.SubtractVV(v, T.position);
  var tX = (a.x * T.R.col1.x + a.y * T.R.col1.y);
  a.y = (a.x * T.R.col2.x + a.y * T.R.col2.y);
  a.x = tX;
  return a;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.AddVV = function (a, b) {
  return Box2D.Common.Math.b2Vec2.Get(a.x + b.x, a.y + b.y);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.SubtractVV = function (a, b) {
  return Box2D.Common.Math.b2Vec2.Get(a.x - b.x, a.y - b.y);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {number}
 */
Box2D.Common.Math.b2Math.Distance = function (a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return Math.sqrt(Box2D.Common.Math.b2Math.DistanceSquared(a,b));
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} b
 * @return {number}
 */
Box2D.Common.Math.b2Math.DistanceSquared = function (a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return (cX * cX + cY * cY);
};
/**
 * @param {number} s
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.MulFV = function (s, a) {
  return Box2D.Common.Math.b2Vec2.Get(s * a.x, s * a.y);
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Mat22} B
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Math.AddMM = function (A, B) {
  return Box2D.Common.Math.b2Mat22.FromVV(Box2D.Common.Math.b2Math.AddVV(A.col1, B.col1), Box2D.Common.Math.b2Math.AddVV(A.col2, B.col2));
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Mat22} B
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Math.MulMM = function (A, B) {
  return Box2D.Common.Math.b2Mat22.FromVV(Box2D.Common.Math.b2Math.MulMV(A, B.col1), Box2D.Common.Math.b2Math.MulMV(A, B.col2));
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @param {!Box2D.Common.Math.b2Mat22} B
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Math.MulTMM = function (A, B) {
  var c1 = Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(A.col1, B.col1), Box2D.Common.Math.b2Math.Dot(A.col2, B.col1));
  var c2 = Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(A.col1, B.col2), Box2D.Common.Math.b2Math.Dot(A.col2, B.col2));
  return Box2D.Common.Math.b2Mat22.FromVV(c1, c2);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.AbsV = function (a) {
  return Box2D.Common.Math.b2Vec2.Get(Math.abs(a.x), Math.abs(a.y));
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} A
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Math.AbsM = function (A) {
  return Box2D.Common.Math.b2Mat22.FromVV(Box2D.Common.Math.b2Math.AbsV(A.col1), Box2D.Common.Math.b2Math.AbsV(A.col2));
};
/**
 * @param {number} a
 * @param {number} low
 * @param {number} high
 * @return {number}
 */
Box2D.Common.Math.b2Math.Clamp = function (a, low, high) {
  return a < low ? low : a > high ? high : a;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} a
 * @param {!Box2D.Common.Math.b2Vec2} low
 * @param {!Box2D.Common.Math.b2Vec2} high
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Math.ClampV = function (a, low, high) {
    var x = Box2D.Common.Math.b2Math.Clamp(a.x, low.x, high.x);
    var y = Box2D.Common.Math.b2Math.Clamp(a.y, low.y, high.y);
  return Box2D.Common.Math.b2Vec2.Get(x, y);
};
/**
 * @constructor
 */
Box2D.Common.Math.b2Mat22 = function() {
    this.col1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.col2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.SetIdentity();
};
/**
 * @param {number} angle
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.FromAngle = function(angle) {
    var mat = new Box2D.Common.Math.b2Mat22();
    mat.Set(angle);
    return mat;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} c1
 * @param {!Box2D.Common.Math.b2Vec2} c2
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.FromVV = function(c1, c2) {
    var mat = new Box2D.Common.Math.b2Mat22();
    mat.SetVV(c1, c2);
    return mat;
};
/**
 * @param {number} angle
 */
Box2D.Common.Math.b2Mat22.prototype.Set = function(angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    this.col1.Set(c, s);
    this.col2.Set(-s, c);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} c1
 * @param {!Box2D.Common.Math.b2Vec2} c2
 */
Box2D.Common.Math.b2Mat22.prototype.SetVV = function(c1, c2) {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
};
/**
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.prototype.Copy = function() {
    var mat = new Box2D.Common.Math.b2Mat22();
    mat.SetM(this);
    return mat;
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} m
 */
Box2D.Common.Math.b2Mat22.prototype.SetM = function(m) {
    this.col1.SetV(m.col1);
    this.col2.SetV(m.col2);
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} m
 */
Box2D.Common.Math.b2Mat22.prototype.AddM = function(m) {
    this.col1.Add(m.col1);
    this.col2.Add(m.col2);
};
Box2D.Common.Math.b2Mat22.prototype.SetIdentity = function() {
    this.col1.Set(1, 0);
    this.col2.Set(0, 1);
};
Box2D.Common.Math.b2Mat22.prototype.SetZero = function() {
    this.col1.Set(0, 0);
    this.col2.Set(0, 0);
};
/**
 * @return {number}
 */
Box2D.Common.Math.b2Mat22.prototype.GetAngle = function() {
    return Math.atan2(this.col1.y, this.col1.x);
};
/**
 * @param {!Box2D.Common.Math.b2Mat22} out
 * @return {!Box2D.Common.Math.b2Mat22}
 */
Box2D.Common.Math.b2Mat22.prototype.GetInverse = function(out) {
    var det = this.col1.x * this.col2.y - this.col2.x * this.col1.y;
    if (det !== 0) {
        det = 1 / det;
    }
    out.col1.x = det * this.col2.y;
    out.col2.x = -det * this.col2.x;
    out.col1.y = -det * this.col1.y;
    out.col2.y = det * this.col1.x;
    return out;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} out
 * @param {number} bX
 * @param {number} bY
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Mat22.prototype.Solve = function(out, bX, bY) {
    var det = this.col1.x * this.col2.y - this.col2.x * this.col1.y;
    if (det !== 0) {
        det = 1 / det;
    }
    out.x = det * (this.col2.y * bX - this.col2.x * bY);
    out.y = det * (this.col1.x * bY - this.col1.y * bX);
    return out;
};
Box2D.Common.Math.b2Mat22.prototype.Abs = function() {
    this.col1.Abs();
    this.col2.Abs();
};
/**
 * @param {!Box2D.Common.Math.b2Vec3=} c1
 * @param {!Box2D.Common.Math.b2Vec3=} c2
 * @param {!Box2D.Common.Math.b2Vec3=} c3
 * @constructor
 */
Box2D.Common.Math.b2Mat33 = function(c1, c2, c3) {
    this.col1 = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    this.col2 = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    this.col3 = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    if (c1) {
        this.col1.SetV(c1);
    }
    if (c2) {
        this.col2.SetV(c2);
    }
    if (c3) {
        this.col3.SetV(c3);
    }
};
/**
 * @param {!Box2D.Common.Math.b2Vec3} c1
 * @param {!Box2D.Common.Math.b2Vec3} c2
 * @param {!Box2D.Common.Math.b2Vec3} c3
 */
Box2D.Common.Math.b2Mat33.prototype.SetVVV = function(c1, c2, c3) {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
    this.col3.SetV(c3);
};
/**
 * @return {!Box2D.Common.Math.b2Mat33}
 */
Box2D.Common.Math.b2Mat33.prototype.Copy = function() {
    return new Box2D.Common.Math.b2Mat33(this.col1, this.col2, this.col3);
};
/**
 * @param {!Box2D.Common.Math.b2Mat33} m
 */
Box2D.Common.Math.b2Mat33.prototype.SetM = function(m) {
    this.col1.SetV(m.col1);
    this.col2.SetV(m.col2);
    this.col3.SetV(m.col3);
};
/**
 * @param {!Box2D.Common.Math.b2Mat33} m
 */
Box2D.Common.Math.b2Mat33.prototype.AddM = function(m) {
    this.col1.x += m.col1.x;
    this.col1.y += m.col1.y;
    this.col1.z += m.col1.z;
    this.col2.x += m.col2.x;
    this.col2.y += m.col2.y;
    this.col2.z += m.col2.z;
    this.col3.x += m.col3.x;
    this.col3.y += m.col3.y;
    this.col3.z += m.col3.z;
};
Box2D.Common.Math.b2Mat33.prototype.SetIdentity = function() {
    this.col1.Set(1,0,0);
    this.col2.Set(0,1,0);
    this.col3.Set(0,0,1);
};
Box2D.Common.Math.b2Mat33.prototype.SetZero = function() {
    this.col1.Set(0,0,0);
    this.col2.Set(0,0,0);
    this.col3.Set(0,0,0);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} out
 * @param {number} bX
 * @param {number} bY
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Mat33.prototype.Solve22 = function(out, bX, bY) {
    var a11 = this.col1.x;
    var a12 = this.col2.x;
    var a21 = this.col1.y;
    var a22 = this.col2.y;
    var det = a11 * a22 - a12 * a21;
    if (det != 0.0) {
        det = 1.0 / det;
    }
    out.x = det * (a22 * bX - a12 * bY);
    out.y = det * (a11 * bY - a21 * bX);
    return out;
};
/**
 * @param {!Box2D.Common.Math.b2Vec3} out
 * @param {number} bX
 * @param {number} bY
 * @param {number} bZ
 * @return {!Box2D.Common.Math.b2Vec3}
 */
Box2D.Common.Math.b2Mat33.prototype.Solve33 = function(out, bX, bY, bZ) {
    var a11 = this.col1.x;
    var a21 = this.col1.y;
    var a31 = this.col1.z;
    var a12 = this.col2.x;
    var a22 = this.col2.y;
    var a32 = this.col2.z;
    var a13 = this.col3.x;
    var a23 = this.col3.y;
    var a33 = this.col3.z;
    var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
    if (det != 0.0) {
        det = 1.0 / det;
    }
    out.x = det * (bX * (a22 * a33 - a32 * a23) + bY * (a32 * a13 - a12 * a33) + bZ * (a12 * a23 - a22 * a13));
    out.y = det * (a11 * (bY * a33 - bZ * a23) + a21 * (bZ * a13 - bX * a33) + a31 * (bX * a23 - bY * a13));
    out.z = det * (a11 * (a22 * bZ - a32 * bY) + a21 * (a32 * bX - a12 * bZ) + a31 * (a12 * bY - a22 * bX));
    return out;
}
/**
 * @constructor
 */
Box2D.Common.Math.b2Sweep = function() {
    this.localCenter = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.c0 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.c = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
Box2D.Common.Math.b2Sweep.prototype.Set = function(other) {
    this.localCenter.SetV(other.localCenter);
    this.c0.SetV(other.c0);
    this.c.SetV(other.c);
    this.a0 = other.a0;
    this.a = other.a;
    this.t0 = other.t0;
};
Box2D.Common.Math.b2Sweep.prototype.Copy = function() {
    var copy = new Box2D.Common.Math.b2Sweep();
    copy.localCenter.SetV(this.localCenter);
    copy.c0.SetV(this.c0);
    copy.c.SetV(this.c);
    copy.a0 = this.a0;
    copy.a = this.a;
    copy.t0 = this.t0;
    return copy;
};
Box2D.Common.Math.b2Sweep.prototype.GetTransform = function(xf, alpha) {
    if (alpha === undefined) alpha = 0;
    xf.position.x = (1.0 - alpha) * this.c0.x + alpha * this.c.x;
    xf.position.y = (1.0 - alpha) * this.c0.y + alpha * this.c.y;
    var angle = (1.0 - alpha) * this.a0 + alpha * this.a;
    xf.R.Set(angle);
    var tMat = xf.R;
    xf.position.x -= (tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y);
    xf.position.y -= (tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y);
};
Box2D.Common.Math.b2Sweep.prototype.Advance = function(t) {
    if (t === undefined) t = 0;
    if (this.t0 < t && 1.0 - this.t0 > Number.MIN_VALUE) {
        var alpha = (t - this.t0) / (1.0 - this.t0);
        this.c0.x = (1.0 - alpha) * this.c0.x + alpha * this.c.x;
        this.c0.y = (1.0 - alpha) * this.c0.y + alpha * this.c.y;
        this.a0 = (1.0 - alpha) * this.a0 + alpha * this.a;
        this.t0 = t;
    }
};
/**
 * @param {!Box2D.Common.Math.b2Vec2=} pos
 * @param {!Box2D.Common.Math.b2Mat22=} r
 * @constructor
 */
Box2D.Common.Math.b2Transform = function(pos, r) {
    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.R = new Box2D.Common.Math.b2Mat22();
    if (pos) {
        this.position.SetV(pos);
    }
    if (r) {
        this.R.SetM(r);
    }
};
Box2D.Common.Math.b2Transform.prototype.Initialize = function(pos, r) {
    this.position.SetV(pos);
    this.R.SetM(r);
};
Box2D.Common.Math.b2Transform.prototype.SetIdentity = function() {
    this.position.SetZero();
    this.R.SetIdentity();
};
Box2D.Common.Math.b2Transform.prototype.Set = function(x) {
    this.position.SetV(x.position);
    this.R.SetM(x.R);
};
Box2D.Common.Math.b2Transform.prototype.GetAngle = function() {
    return Math.atan2(this.R.col1.y, this.R.col1.x);
};
/**
 * @private
 * @param {number} x
 * @param {number} y
 * @constructor
 */
Box2D.Common.Math.b2Vec2 = function(x, y) {
    this.x = x;
    this.y = y;
};
/**
 * @private
 * @type {Array.<!Box2D.Common.Math.b2Vec2>}
 */
Box2D.Common.Math.b2Vec2._freeCache = [];
/**
 * @param {number} x
 * @param {number} y
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Vec2.Get = function(x, y) {
    if (Box2D.Common.Math.b2Vec2._freeCache.length > 0) {
        var vec = Box2D.Common.Math.b2Vec2._freeCache.pop();
        vec.Set(x, y);
        return vec;
    }
    return new Box2D.Common.Math.b2Vec2(x, y);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} vec
 */
Box2D.Common.Math.b2Vec2.Free = function(vec) {
    Box2D.Common.Math.b2Vec2._freeCache.push(vec);
};
Box2D.Common.Math.b2Vec2.prototype.SetZero = function() {
    this.x = 0.0;
    this.y = 0.0;
};
/**
 * @param {number} x
 * @param {number} y
 */
Box2D.Common.Math.b2Vec2.prototype.Set = function(x, y) {
    this.x = x;
    this.y = y;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} v
 */
Box2D.Common.Math.b2Vec2.prototype.SetV = function(v) {
    this.x = v.x;
    this.y = v.y;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Vec2.prototype.GetNegative = function() {
    return Box2D.Common.Math.b2Vec2.Get((-this.x), (-this.y));
};
Box2D.Common.Math.b2Vec2.prototype.NegativeSelf = function() {
    this.x = (-this.x);
    this.y = (-this.y);
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Common.Math.b2Vec2.prototype.Copy = function() {
    return Box2D.Common.Math.b2Vec2.Get(this.x, this.y);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} v
 */
Box2D.Common.Math.b2Vec2.prototype.Add = function(v) {
    this.x += v.x;
    this.y += v.y;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} v
 */
Box2D.Common.Math.b2Vec2.prototype.Subtract = function(v) {
    this.x -= v.x;
    this.y -= v.y;
};
/**
 * @param {number} a
 */
Box2D.Common.Math.b2Vec2.prototype.Multiply = function(a) {
    this.x *= a;
    this.y *= a;
};
/**
 * @param {Box2D.Common.Math.b2Mat22} A
 */
Box2D.Common.Math.b2Vec2.prototype.MulM = function(A) {
    var tX = this.x;
    this.x = A.col1.x * tX + A.col2.x * this.y;
    this.y = A.col1.y * tX + A.col2.y * this.y;
};
/**
 * @param {Box2D.Common.Math.b2Mat22} A
 */
Box2D.Common.Math.b2Vec2.prototype.MulTM = function(A) {
    var tX = this.x * A.col1.x + this.y * A.col1.y;
    this.y = this.x * A.col2.x + this.y * A.col2.y;
    this.x = tX;
};
/**
 * @param {number} s
 */
Box2D.Common.Math.b2Vec2.prototype.CrossVF = function(s) {
    var tX = this.x;
    this.x = s * this.y;
    this.y = (-s * tX);
};
/**
 * @param {number} s
 */
Box2D.Common.Math.b2Vec2.prototype.CrossFV = function(s) {
    var tX = this.x;
    this.x = (-s * this.y);
    this.y = s * tX;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} b
 */
Box2D.Common.Math.b2Vec2.prototype.MinV = function(b) {
    this.x = Math.min(this.x, b.x);
    this.y = Math.min(this.y, b.y);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} b
 */
Box2D.Common.Math.b2Vec2.prototype.MaxV = function(b) {
    this.x = Math.max(this.x, b.x);
    this.y = Math.max(this.y, b.y);
};
Box2D.Common.Math.b2Vec2.prototype.Abs = function() {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
};
/**
 * @return {number}
 */
Box2D.Common.Math.b2Vec2.prototype.Length = function() {
    return Math.sqrt(this.LengthSquared());
};
/**
 * @return {number}
 */
Box2D.Common.Math.b2Vec2.prototype.LengthSquared = function() {
    return (this.x * this.x + this.y * this.y);
};
/**
 * @return {number}
 */
Box2D.Common.Math.b2Vec2.prototype.Normalize = function() {
    var length = this.Length();
    if (length < Number.MIN_VALUE) {
        return 0.0;
    }
    var invLength = 1.0 / length;
    this.x *= invLength;
    this.y *= invLength;
    return length;
};
/**
 * @return {boolean}
 */
Box2D.Common.Math.b2Vec2.prototype.IsValid = function () {
  return isFinite(this.x) && isFinite(this.y);
};
/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @constructor
 */
Box2D.Common.Math.b2Vec3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};
Box2D.Common.Math.b2Vec3.prototype.SetZero = function() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
};
/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
Box2D.Common.Math.b2Vec3.prototype.Set = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}
/**
 * @param {!Box2D.Common.Math.b2Vec3} v
 */
Box2D.Common.Math.b2Vec3.prototype.SetV = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
};
/**
 * @return {!Box2D.Common.Math.b2Vec3}
 */
Box2D.Common.Math.b2Vec3.prototype.GetNegative = function() {
    return new Box2D.Common.Math.b2Vec3((-this.x), (-this.y), (-this.z));
};
Box2D.Common.Math.b2Vec3.prototype.NegativeSelf = function() {
    this.x = (-this.x);
    this.y = (-this.y);
    this.z = (-this.z);
};
/**
 * @return {!Box2D.Common.Math.b2Vec3}
 */
Box2D.Common.Math.b2Vec3.prototype.Copy = function() {
    return new Box2D.Common.Math.b2Vec3(this.x, this.y, this.z);
};
/**
 * @param {!Box2D.Common.Math.b2Vec3} v
 */
Box2D.Common.Math.b2Vec3.prototype.Add = function(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
};
/**
 * @param {!Box2D.Common.Math.b2Vec3} v
 */
Box2D.Common.Math.b2Vec3.prototype.Subtract = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
};
/**
 * @param {number} a
 */
Box2D.Common.Math.b2Vec3.prototype.Multiply = function(a) {
    this.x *= a;
    this.y *= a;
    this.z *= a;
};
/**
 * @constructor
 */
Box2D.Collision.Shapes.b2Shape = function() {
    this.m_radius = Box2D.Common.b2Settings.b2_linearSlop;
};
/**
 * @return {string}
 */
Box2D.Collision.Shapes.b2Shape.prototype.GetTypeName = function(){};
/**
 * @return {!Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Collision.Shapes.b2Shape.prototype.Copy = function(){};
/**
 * @param {!Box2D.Collision.Shapes.b2Shape} other
 */
Box2D.Collision.Shapes.b2Shape.prototype.Set = function(other) {
    this.m_radius = other.m_radius;
};
/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2Shape.prototype.TestPoint = function(){};
/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2Shape.prototype.RayCast = function(){};
/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Transform} transform
 */
Box2D.Collision.Shapes.b2Shape.prototype.ComputeAABB = function(){};
/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 * @param {number} density
 */
Box2D.Collision.Shapes.b2Shape.prototype.ComputeMass = function(){};
/**
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} c
 * @return {number}
 */
Box2D.Collision.Shapes.b2Shape.prototype.ComputeSubmergedArea = function(){};
/**
 * @param {!Box2D.Collision.b2DistanceProxy} proxy
 */
Box2D.Collision.Shapes.b2Shape.prototype.SetDistanceProxy = function(){};
/**
 * @param {!Box2D.Collision.Shapes.b2Shape} shape1
 * @param {!Box2D.Common.Math.b2Transform} transform1
 * @param {!Box2D.Collision.Shapes.b2Shape} shape2
 * @param {!Box2D.Common.Math.b2Transform} transform2
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2Shape.TestOverlap = function(shape1, transform1, shape2, transform2) {
    var input = new Box2D.Collision.b2DistanceInput();
    input.proxyA = new Box2D.Collision.b2DistanceProxy();
    input.proxyA.Set(shape1);
    input.proxyB = new Box2D.Collision.b2DistanceProxy();
    input.proxyB.Set(shape2);
    input.transformA = transform1;
    input.transformB = transform2;
    input.useRadii = true;
    var simplexCache = new Box2D.Collision.b2SimplexCache();
    simplexCache.count = 0;
    var output = new Box2D.Collision.b2DistanceOutput();
    Box2D.Collision.b2Distance.Distance(output, simplexCache, input);
    return output.distance < 10.0 * Number.MIN_VALUE;
};
/**
 * @const
 * @type {number}
 */
Box2D.Collision.Shapes.b2Shape.e_startsInsideCollide = -1;
/**
 * @const
 * @type {number}
 */
Box2D.Collision.Shapes.b2Shape.e_missCollide = 0;
/**
 * @const
 * @type {number}
 */
Box2D.Collision.Shapes.b2Shape.e_hitCollide = 1;
/**
 * @param {number} radius
 * @constructor
 * @extends {Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Collision.Shapes.b2CircleShape = function(radius) {
    Box2D.Collision.Shapes.b2Shape.call(this);
    /** @type {number} */
    this.m_radius = radius;
    /** @type {number} */
    this.m_radiusSquared = radius * radius;
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_p = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
c2inherit(Box2D.Collision.Shapes.b2CircleShape, Box2D.Collision.Shapes.b2Shape);
/**
 * @return {string}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.GetTypeName = function() {
    return Box2D.Collision.Shapes.b2CircleShape.NAME;
};
/**
 * @return {!Box2D.Collision.Shapes.b2CircleShape}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.Copy = function() {
    var s = new Box2D.Collision.Shapes.b2CircleShape(this.m_radius);
    s.Set(this);
    return s;
};
/**
 * @param {!Box2D.Collision.Shapes.b2Shape} other
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.Set = function(other) {
    Box2D.Collision.Shapes.b2Shape.prototype.Set.call(this, other);
    if (other instanceof Box2D.Collision.Shapes.b2CircleShape) {
        this.m_p.SetV(other.m_p);
    }
};
/**
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.TestPoint = function(transform, p) {
    var tMat = transform.R;
    var dX = p.x - (transform.position.x + (transform.R.col1.x * this.m_p.x + transform.R.col2.x * this.m_p.y));
    var dY = p.y - (transform.position.y + (transform.R.col1.y * this.m_p.x + transform.R.col2.y * this.m_p.y));
    return (dX * dX + dY * dY) <= this.m_radiusSquared;
};
/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.RayCast = function(output, input, transform) {
    var tMat = transform.R;
    var positionX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
    var positionY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
    var sX = input.p1.x - positionX;
    var sY = input.p1.y - positionY;
    var b = (sX * sX + sY * sY) - this.m_radiusSquared;
    var rX = input.p2.x - input.p1.x;
    var rY = input.p2.y - input.p1.y;
    var c = (sX * rX + sY * rY);
    var rr = (rX * rX + rY * rY);
    var sigma = c * c - rr * b;
    if (sigma < 0.0 || rr < Number.MIN_VALUE) {
        return false;
    }
    var a = (-(c + Math.sqrt(sigma)));
    if (0.0 <= a && a <= input.maxFraction * rr) {
        a /= rr;
        output.fraction = a;
        output.normal.x = sX + a * rX;
        output.normal.y = sY + a * rY;
        output.normal.Normalize();
        return true;
    }
    return false;
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Transform} transform
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeAABB = function(aabb, transform) {
    var tMat = transform.R;
    var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
    var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
    aabb.lowerBound_.Set(pX - this.m_radius, pY - this.m_radius);
    aabb.upperBound_.Set(pX + this.m_radius, pY + this.m_radius);
};
/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 * @param {number} density
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeMass = function(massData, density) {
    massData.mass = density * Math.PI * this.m_radiusSquared;
    massData.center.SetV(this.m_p);
    massData.I = massData.mass * (0.5 * this.m_radiusSquared + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y));
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} c
 * @return {number}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
    var p = Box2D.Common.Math.b2Math.MulX(xf, this.m_p);
    var l = (-(Box2D.Common.Math.b2Math.Dot(normal, p) - offset));
    if (l < (-this.m_radius) + Number.MIN_VALUE) {
        return 0;
    }
    if (l > this.m_radius) {
        c.SetV(p);
        return Math.PI * this.m_radiusSquared;
    }
    var l2 = l * l;
    var area = this.m_radiusSquared * (Math.asin(l / this.m_radius) + Math.PI / 2) + l * Math.sqrt(this.m_radiusSquared - l2);
    var com = (-2 / 3 * Math.pow(this.m_radiusSquared - l2, 1.5) / area);
    c.x = p.x + normal.x * com;
    c.y = p.y + normal.y * com;
    return area;
};
/**
 * @param {!Box2D.Collision.b2DistanceProxy} proxy
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.SetDistanceProxy = function(proxy) {
    proxy.m_vertices = [this.m_p];
    proxy.m_count = 1;
    proxy.m_radius = this.m_radius;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.GetLocalPosition = function() {
    return this.m_p;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} position
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.SetLocalPosition = function(position) {
    this.m_p.SetV(position);
};
/**
 * @return {number}
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.GetRadius = function() {
    return this.m_radius;
};
/**
 * @param {number} radius
 */
Box2D.Collision.Shapes.b2CircleShape.prototype.SetRadius = function(radius) {
    this.m_radius = radius;
    this.m_radiusSquared = radius * radius;
};
/**
 * @const
 * @type {string}
 */
Box2D.Collision.Shapes.b2CircleShape.NAME = 'b2CircleShape';
/**
 * @constructor
 */
Box2D.Collision.Shapes.b2EdgeChainDef = function() {
    /** @type {number} */
    this.vertexCount = 0;
    /** @type {boolean} */
    this.isALoop = true;
    /** @type {Array.<Box2D.Common.Math.b2Vec2} */
    this.vertices = [];
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} v1
 * @param {!Box2D.Common.Math.b2Vec2} v2
 * @constructor
 * @extends {Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Collision.Shapes.b2EdgeShape = function(v1, v2) {
    Box2D.Collision.Shapes.b2Shape.call(this);
    /** @type {Box2D.Collision.Shapes.b2EdgeShape} */
    this.m_prevEdge = null;
    /** @type {Box2D.Collision.Shapes.b2EdgeShape} */
    this.m_nextEdge = null;
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_v1 = v1;
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_v2 = v2;
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_direction = Box2D.Common.Math.b2Vec2.Get(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
    /** @type {number} */
    this.m_length = this.m_direction.Normalize();
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(this.m_direction.y, -this.m_direction.x);
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_coreV1 = Box2D.Common.Math.b2Vec2.Get((-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x)) + this.m_v1.x, (-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y)) + this.m_v1.y);
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_coreV2 = Box2D.Common.Math.b2Vec2.Get((-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x)) + this.m_v2.x, (-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y)) + this.m_v2.y);
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_cornerDir1 = this.m_normal;
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_cornerDir2 = Box2D.Common.Math.b2Vec2.Get(-this.m_normal.x, -this.m_normal.y);
    /** @type {boolean} */
    this.m_cornerConvex1 = false;
    /** @type {boolean} */
    this.m_cornerConvex2 = false;
};
c2inherit(Box2D.Collision.Shapes.b2EdgeShape, Box2D.Collision.Shapes.b2Shape);
/**
 * @return {string}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetTypeName = function() {
    return Box2D.Collision.Shapes.b2EdgeShape.NAME;
};
/**
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.TestPoint = function(transform, p) {
    return false;
};
/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.RayCast = function(output, input, transform) {
    var rX = input.p2.x - input.p1.x;
    var rY = input.p2.y - input.p1.y;
    var tMat = transform.R;
    var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
    var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
    var nX = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y) - v1Y;
    var nY = (-(transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y) - v1X));
    var k_slop = 100.0 * Number.MIN_VALUE;
    var denom = (-(rX * nX + rY * nY));
    if (denom > k_slop) {
        var bX = input.p1.x - v1X;
        var bY = input.p1.y - v1Y;
        var a = (bX * nX + bY * nY);
        if (0.0 <= a && a <= input.maxFraction * denom) {
            var mu2 = (-rX * bY) + rY * bX;
            if ((-k_slop * denom) <= mu2 && mu2 <= denom * (1.0 + k_slop)) {
                a /= denom;
                output.fraction = a;
                var nLen = Math.sqrt(nX * nX + nY * nY);
                output.normal.x = nX / nLen;
                output.normal.y = nY / nLen;
                return true;
            }
        }
    }
    return false;
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Transform} transform
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeAABB = function(aabb, transform) {
    var tMat = transform.R;
    var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
    var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
    var v2X = transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y);
    var v2Y = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y);
    if (v1X < v2X) {
        aabb.lowerBound_.x = v1X;
        aabb.upperBound_.x = v2X;
    } else {
        aabb.lowerBound_.x = v2X;
        aabb.upperBound_.x = v1X;
    }
    if (v1Y < v2Y) {
        aabb.lowerBound_.y = v1Y;
        aabb.upperBound_.y = v2Y;
    } else {
        aabb.lowerBound_.y = v2Y;
        aabb.upperBound_.y = v1Y;
    }
};
/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 * @param {number} density
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeMass = function(massData, density) {
    massData.mass = 0;
    massData.center.SetV(this.m_v1);
    massData.I = 0;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} c
 * @return {number}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
    if (offset === undefined) offset = 0;
    var v0 = Box2D.Common.Math.b2Vec2.Get(normal.x * offset, normal.y * offset);
    var v1 = Box2D.Common.Math.b2Math.MulX(xf, this.m_v1);
    var v2 = Box2D.Common.Math.b2Math.MulX(xf, this.m_v2);
    var d1 = Box2D.Common.Math.b2Math.Dot(normal, v1) - offset;
    var d2 = Box2D.Common.Math.b2Math.Dot(normal, v2) - offset;
    if (d1 > 0) {
        if (d2 > 0) {
            return 0;
        } else {
            v1.x = (-d2 / (d1 - d2) * v1.x) + d1 / (d1 - d2) * v2.x;
            v1.y = (-d2 / (d1 - d2) * v1.y) + d1 / (d1 - d2) * v2.y;
        }
    } else {
        if (d2 > 0) {
            v2.x = (-d2 / (d1 - d2) * v1.x) + d1 / (d1 - d2) * v2.x;
            v2.y = (-d2 / (d1 - d2) * v1.y) + d1 / (d1 - d2) * v2.y;
        }
    }
    c.x = (v0.x + v1.x + v2.x) / 3;
    c.y = (v0.y + v1.y + v2.y) / 3;
    return 0.5 * ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x));
};
/**
 * @return {number}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetLength = function() {
    return this.m_length;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetVertex1 = function() {
    return this.m_v1;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetVertex2 = function() {
    return this.m_v2;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCoreVertex1 = function() {
    return this.m_coreV1;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCoreVertex2 = function() {
    return this.m_coreV2;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetNormalVector = function() {
    return this.m_normal;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetDirectionVector = function() {
    return this.m_direction;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCorner1Vector = function() {
    return this.m_cornerDir1;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCorner2Vector = function() {
    return this.m_cornerDir2;
};
/**
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.Corner1IsConvex = function() {
    return this.m_cornerConvex1;
};
/**
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.Corner2IsConvex = function() {
    return this.m_cornerConvex2;
};
/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetFirstVertex = function(xf) {
    var tMat = xf.R;
    return Box2D.Common.Math.b2Vec2.Get(xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y), xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y));
};
/**
 * @return {Box2D.Collision.Shapes.b2EdgeShape}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetNextEdge = function() {
    return this.m_nextEdge;
};
/**
 * @return {Box2D.Collision.Shapes.b2EdgeShape}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetPrevEdge = function() {
    return this.m_prevEdge;
};
/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {number} dX
 * @param {number} dY
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.Support = function(xf, dX, dY) {
    var tMat = xf.R;
    var v1X = xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y);
    var v1Y = xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y);
    var v2X = xf.position.x + (tMat.col1.x * this.m_coreV2.x + tMat.col2.x * this.m_coreV2.y);
    var v2Y = xf.position.y + (tMat.col1.y * this.m_coreV2.x + tMat.col2.y * this.m_coreV2.y);
    if ((v1X * dX + v1Y * dY) > (v2X * dX + v2Y * dY)) {
        return Box2D.Common.Math.b2Vec2.Get(v1X, v1Y);
    } else {
        return Box2D.Common.Math.b2Vec2.Get(v2X, v2Y);
    }
};
/**
 * @param {Box2D.Collision.Shapes.b2EdgeShape} edge
 * @param {!Box2D.Common.Math.b2Vec2} core
 * @param {!Box2D.Common.Math.b2Vec2} cornerDir
 * @param {boolean} convex
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.SetPrevEdge = function(edge, core, cornerDir, convex) {
    this.m_prevEdge = edge;
    this.m_coreV1 = core;
    this.m_cornerDir1 = cornerDir;
    this.m_cornerConvex1 = convex;
};
/**
 * @param {Box2D.Collision.Shapes.b2EdgeShape} edge
 * @param {!Box2D.Common.Math.b2Vec2} core
 * @param {!Box2D.Common.Math.b2Vec2} cornerDir
 * @param {boolean} convex
 */
Box2D.Collision.Shapes.b2EdgeShape.prototype.SetNextEdge = function(edge, core, cornerDir, convex) {
    this.m_nextEdge = edge;
    this.m_coreV2 = core;
    this.m_cornerDir2 = cornerDir;
    this.m_cornerConvex2 = convex;
};
/**
 * @const
 * @type {string}
 */
Box2D.Collision.Shapes.b2EdgeShape.NAME = 'b2EdgeShape';
/**
 * @constructor
 */
Box2D.Collision.Shapes.b2MassData = function() {
    /** @type {number} */
    this.mass = 0;
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.center = Box2D.Common.Math.b2Vec2.Get(0, 0);
    /** @type {number} */
    this.I = 0;
};
/**
 * @constructor
 * @extends {Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Collision.Shapes.b2PolygonShape = function() {
    Box2D.Collision.Shapes.b2Shape.call(this);
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.m_centroid = Box2D.Common.Math.b2Vec2.Get(0, 0);
    /** @type {Array.<!Box2D.Common.Math.b2Vec2>} */
    this.m_vertices = [];
    /** @type {Array.<!Box2D.Common.Math.b2Vec2>} */
    this.m_normals = [];
};
c2inherit(Box2D.Collision.Shapes.b2PolygonShape, Box2D.Collision.Shapes.b2Shape);
/**
 * @return {string}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetTypeName = function() {
    return Box2D.Collision.Shapes.b2PolygonShape.NAME;
};
/**
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.Copy = function() {
    var s = new Box2D.Collision.Shapes.b2PolygonShape();
    s.Set(this);
    return s;
};
/**
 * @param {!Box2D.Collision.Shapes.b2Shape} other
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.Set = function(other) {
    Box2D.Collision.Shapes.b2Shape.prototype.Set.call(this, other);
    if (other instanceof Box2D.Collision.Shapes.b2PolygonShape) {
        this.m_centroid.SetV(other.m_centroid);
        this.m_vertexCount = other.m_vertexCount;
        this.Reserve(this.m_vertexCount);
        for (var i = 0; i < this.m_vertexCount; i++) {
            this.m_vertices[i].SetV(other.m_vertices[i]);
            this.m_normals[i].SetV(other.m_normals[i]);
        }
    }
};
/**
 * @param {Array.<Box2D.Common.Math.b2Vec2>} vertices
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsArray = function(vertices) {
    this.SetAsVector(vertices);
};
/**
 * @param {Array.<Box2D.Common.Math.b2Vec2>} vertices
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsArray = function(vertices) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsArray(vertices);
    return polygonShape;
};
/**
 * @param {Array.<!Box2D.Common.Math.b2Vec2>} vertices
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsVector = function(vertices) {
    var vertexCount = vertices.length;
;
    this.m_vertexCount = vertexCount;
    this.Reserve(vertexCount);
    var i = 0;
    for (i = 0; i < this.m_vertexCount; i++) {
        this.m_vertices[i].SetV(vertices[i]);
    }
    for (i = 0; i < this.m_vertexCount; ++i) {
        var i1 = i;
        var i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;
        var edge = Box2D.Common.Math.b2Math.SubtractVV(this.m_vertices[i2], this.m_vertices[i1]);
;
        this.m_normals[i].SetV(Box2D.Common.Math.b2Math.CrossVF(edge, 1.0));
        this.m_normals[i].Normalize();
    }
    this.m_centroid = Box2D.Collision.Shapes.b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount);
};
/**
 * @param {Array.<Box2D.Common.Math.b2Vec2>} vertices
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsVector = function(vertices) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsVector(vertices);
    return polygonShape;
};
/**
 * @param {number} hx
 * @param {number} hy
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsBox = function(hx, hy) {
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set((-hx), (-hy));
    this.m_vertices[1].Set(hx, (-hy));
    this.m_vertices[2].Set(hx, hy);
    this.m_vertices[3].Set((-hx), hy);
    this.m_normals[0].Set(0.0, (-1.0));
    this.m_normals[1].Set(1.0, 0.0);
    this.m_normals[2].Set(0.0, 1.0);
    this.m_normals[3].Set((-1.0), 0.0);
    this.m_centroid.SetZero();
};
/**
 * @param {number} hx
 * @param {number} hy
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsBox = function(hx, hy) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsBox(hx, hy);
    return polygonShape;
};
/**
 * @param {number} hx
 * @param {number} hy
 * @param {!Box2D.Common.Math.b2Vec2} center
 * @param {number} angle
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsOrientedBox = function(hx, hy, center, angle) {
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set((-hx), (-hy));
    this.m_vertices[1].Set(hx, (-hy));
    this.m_vertices[2].Set(hx, hy);
    this.m_vertices[3].Set((-hx), hy);
    this.m_normals[0].Set(0.0, (-1.0));
    this.m_normals[1].Set(1.0, 0.0);
    this.m_normals[2].Set(0.0, 1.0);
    this.m_normals[3].Set((-1.0), 0.0);
    this.m_centroid = center;
    var mat = new Box2D.Common.Math.b2Mat22();
    mat.Set(angle);
    var xf = new Box2D.Common.Math.b2Transform(center, mat);
    for (var i = 0; i < this.m_vertexCount; ++i) {
        this.m_vertices[i] = Box2D.Common.Math.b2Math.MulX(xf, this.m_vertices[i]);
        this.m_normals[i] = Box2D.Common.Math.b2Math.MulMV(xf.R, this.m_normals[i]);
    }
};
/**
 * @param {number} hx
 * @param {number} hy
 * @param {!Box2D.Common.Math.b2Vec2} center
 * @param {number} angle
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsOrientedBox = function(hx, hy, center, angle) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsOrientedBox(hx, hy, center, angle);
    return polygonShape;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} v1
 * @param {!Box2D.Common.Math.b2Vec2} v2
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsEdge = function(v1, v2) {
    this.m_vertexCount = 2;
    this.Reserve(2);
    this.m_vertices[0].SetV(v1);
    this.m_vertices[1].SetV(v2);
    this.m_centroid.x = 0.5 * (v1.x + v2.x);
    this.m_centroid.y = 0.5 * (v1.y + v2.y);
    this.m_normals[0] = Box2D.Common.Math.b2Math.CrossVF(Box2D.Common.Math.b2Math.SubtractVV(v2, v1), 1.0);
    this.m_normals[0].Normalize();
    this.m_normals[1].x = (-this.m_normals[0].x);
    this.m_normals[1].y = (-this.m_normals[0].y);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} v1
 * @param {!Box2D.Common.Math.b2Vec2} v2
 * @return {!Box2D.Collision.Shapes.b2PolygonShape}
 */
Box2D.Collision.Shapes.b2PolygonShape.AsEdge = function(v1, v2) {
    var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape();
    polygonShape.SetAsEdge(v1, v2);
    return polygonShape;
};
/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.TestPoint = function(xf, p) {
    var tVec;
    var tMat = xf.R;
    var tX = p.x - xf.position.x;
    var tY = p.y - xf.position.y;
    var pLocalX = (tX * tMat.col1.x + tY * tMat.col1.y);
    var pLocalY = (tX * tMat.col2.x + tY * tMat.col2.y);
    for (var i = 0; i < this.m_vertexCount; ++i) {
        tVec = this.m_vertices[i];
        tX = pLocalX - tVec.x;
        tY = pLocalY - tVec.y;
        tVec = this.m_normals[i];
        var dot = (tVec.x * tX + tVec.y * tY);
        if (dot > 0.0) {
            return false;
        }
    }
    return true;
};
/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @param {!Box2D.Common.Math.b2Transform} transform
 * @return {boolean}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.RayCast = function(output, input, transform) {
    var lower = 0.0;
    var upper = input.maxFraction;
    var tX = 0;
    var tY = 0;
    var tMat;
    var tVec;
    tX = input.p1.x - transform.position.x;
    tY = input.p1.y - transform.position.y;
    tMat = transform.R;
    var p1X = (tX * tMat.col1.x + tY * tMat.col1.y);
    var p1Y = (tX * tMat.col2.x + tY * tMat.col2.y);
    tX = input.p2.x - transform.position.x;
    tY = input.p2.y - transform.position.y;
    tMat = transform.R;
    var p2X = (tX * tMat.col1.x + tY * tMat.col1.y);
    var p2Y = (tX * tMat.col2.x + tY * tMat.col2.y);
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var index = -1;
    for (var i = 0; i < this.m_vertexCount; ++i) {
        tVec = this.m_vertices[i];
        tX = tVec.x - p1X;
        tY = tVec.y - p1Y;
        tVec = this.m_normals[i];
        var numerator = (tVec.x * tX + tVec.y * tY);
        var denominator = (tVec.x * dX + tVec.y * dY);
        if (denominator == 0.0) {
            if (numerator < 0.0) {
                return false;
            }
        } else {
            if (denominator < 0.0 && numerator < lower * denominator) {
                lower = numerator / denominator;
                index = i;
            } else if (denominator > 0.0 && numerator < upper * denominator) {
                upper = numerator / denominator;
            }
        }
        if (upper < lower - Number.MIN_VALUE) {
            return false;
        }
    }
    if (index >= 0) {
        output.fraction = lower;
        tMat = transform.R;
        tVec = this.m_normals[index];
        output.normal.x = (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        output.normal.y = (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        return true;
    }
    return false;
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Transform} xf
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeAABB = function(aabb, xf) {
    var tMat = xf.R;
    var tVec = this.m_vertices[0];
    var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var upperX = lowerX;
    var upperY = lowerY;
    for (var i = 1; i < this.m_vertexCount; ++i) {
        tVec = this.m_vertices[i];
        var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        lowerX = lowerX < vX ? lowerX : vX;
        lowerY = lowerY < vY ? lowerY : vY;
        upperX = upperX > vX ? upperX : vX;
        upperY = upperY > vY ? upperY : vY;
    }
    aabb.lowerBound_.x = lowerX - this.m_radius;
    aabb.lowerBound_.y = lowerY - this.m_radius;
    aabb.upperBound_.x = upperX + this.m_radius;
    aabb.upperBound_.y = upperY + this.m_radius;
};
/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 * @param {number} density
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeMass = function(massData, density) {
    if (this.m_vertexCount == 2) {
        massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
        massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
        massData.mass = 0.0;
        massData.I = 0.0;
        return;
    }
    var centerX = 0.0;
    var centerY = 0.0;
    var area = 0.0;
    var I = 0.0;
    var p1X = 0.0;
    var p1Y = 0.0;
    var k_inv3 = 1.0 / 3.0;
    for (var i = 0; i < this.m_vertexCount; ++i) {
        var p2 = this.m_vertices[i];
        var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[i + 1] : this.m_vertices[0];
        var e1X = p2.x - p1X;
        var e1Y = p2.y - p1Y;
        var e2X = p3.x - p1X;
        var e2Y = p3.y - p1Y;
        var D = e1X * e2Y - e1Y * e2X;
        var triangleArea = 0.5 * D;
        area += triangleArea;
        centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
        centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
        var px = p1X;
        var py = p1Y;
        var ex1 = e1X;
        var ey1 = e1Y;
        var ex2 = e2X;
        var ey2 = e2Y;
        var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
        var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;
        I += D * (intx2 + inty2);
    }
    massData.mass = density * area;
    centerX *= 1.0 / area;
    centerY *= 1.0 / area;
    massData.center.Set(centerX, centerY);
    massData.I = density * I;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Common.Math.b2Vec2} c
 * @return {number}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
    var normalL = Box2D.Common.Math.b2Math.MulTMV(xf.R, normal);
    var offsetL = offset - Box2D.Common.Math.b2Math.Dot(normal, xf.position);
    var depths = [];
    var diveCount = 0;
    var intoIndex = -1;
    var outoIndex = -1;
    var lastSubmerged = false;
    var i = 0;
    for (i = 0; i < this.m_vertexCount; ++i) {
        depths[i] = Box2D.Common.Math.b2Math.Dot(normalL, this.m_vertices[i]) - offsetL;
        var isSubmerged = depths[i] < (-Number.MIN_VALUE);
        if (i > 0) {
            if (isSubmerged) {
                if (!lastSubmerged) {
                    intoIndex = i - 1;
                    diveCount++;
                }
            } else {
                if (lastSubmerged) {
                    outoIndex = i - 1;
                    diveCount++;
                }
            }
        }
        lastSubmerged = isSubmerged;
    }
    switch (diveCount) {
    case 0:
        if (lastSubmerged) {
            var md = new Box2D.Collision.Shapes.b2MassData();
            this.ComputeMass(md, 1);
            c.SetV(Box2D.Common.Math.b2Math.MulX(xf, md.center));
            return md.mass;
        } else {
            return 0;
        }
        break;
    case 1:
        if (intoIndex == (-1)) {
            intoIndex = this.m_vertexCount - 1;
        } else {
            outoIndex = this.m_vertexCount - 1;
        }
        break;
    }
    var intoIndex2 = ((intoIndex + 1) % this.m_vertexCount);
    var outoIndex2 = ((outoIndex + 1) % this.m_vertexCount);
    var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
    var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
    var intoVec = Box2D.Common.Math.b2Vec2.Get(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
    var outoVec = Box2D.Common.Math.b2Vec2.Get(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
    var area = 0;
    var center = Box2D.Common.Math.b2Vec2.Get(0, 0);
    var p2 = this.m_vertices[intoIndex2];
    var p3;
    i = intoIndex2;
    while (i != outoIndex2) {
        i = (i + 1) % this.m_vertexCount;
        if (i == outoIndex2) p3 = outoVec;
        else p3 = this.m_vertices[i];
        var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
        area += triangleArea;
        center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
        center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
        p2 = p3;
    }
    center.Multiply(1 / area);
    c.SetV(Box2D.Common.Math.b2Math.MulX(xf, center));
    return area;
};
/**
 * @param {!Box2D.Collision.b2DistanceProxy} proxy
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetDistanceProxy = function(proxy) {
    proxy.m_vertices = this.m_vertices;
    proxy.m_count = this.m_vertexCount;
    proxy.m_radius = this.m_radius;
};
/**
 * @return {number}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertexCount = function() {
    return this.m_vertexCount;
};
/**
 * @return {Array.<!Box2D.Common.Math.b2Vec2>}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertices = function() {
    return this.m_vertices;
};
/**
 * @return {Array.<!Box2D.Common.Math.b2Vec2>}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetNormals = function() {
    return this.m_normals;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} d
 * return {number}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetSupport = function(d) {
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1; i < this.m_vertexCount; ++i) {
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue) {
            bestIndex = i;
            bestValue = value;
        }
    }
    return bestIndex;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} d
 * return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetSupportVertex = function(d) {
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1; i < this.m_vertexCount; ++i) {
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue) {
            bestIndex = i;
            bestValue = value;
        }
    }
    return this.m_vertices[bestIndex];
};
/**
 * @param {number} count
 */
Box2D.Collision.Shapes.b2PolygonShape.prototype.Reserve = function(count) {
    this.m_vertices = [];
    this.m_normals = [];
    for (var i = this.m_vertices.length; i < count; i++) {
        this.m_vertices[i] = Box2D.Common.Math.b2Vec2.Get(0, 0);
        this.m_normals[i] = Box2D.Common.Math.b2Vec2.Get(0, 0);
    }
};
/**
 * @param {Array.<!Box2D.Common.Math.b2Vec2>} vs
 * @param {number} count
 * return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.Shapes.b2PolygonShape.ComputeCentroid = function(vs, count) {
    var c = Box2D.Common.Math.b2Vec2.Get(0, 0);
    var area = 0.0;
    var p1X = 0.0;
    var p1Y = 0.0;
    var inv3 = 1.0 / 3.0;
    for (var i = 0; i < count; ++i) {
        var p2 = vs[i];
        var p3 = i + 1 < count ? vs[i + 1] : vs[0];
        var e1X = p2.x - p1X;
        var e1Y = p2.y - p1Y;
        var e2X = p3.x - p1X;
        var e2Y = p3.y - p1Y;
        var D = (e1X * e2Y - e1Y * e2X);
        var triangleArea = 0.5 * D;
        area += triangleArea;
        c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
        c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y);
    }
    c.x *= 1.0 / area;
    c.y *= 1.0 / area;
    return c;
};
/** @type {!Box2D.Common.Math.b2Mat22} */
Box2D.Collision.Shapes.b2PolygonShape.s_mat = new Box2D.Common.Math.b2Mat22();
/**
 * @const
 * @type {string}
 */
Box2D.Collision.Shapes.b2PolygonShape.NAME = 'b2PolygonShape';
/**
 * @constructor
 */
Box2D.Collision.b2ContactID = function() {
    /** @type {number} */
    this._key = 0;
    /** @type {number} */
    this._referenceEdge = 0;
    /** @type {number} */
    this._incidentEdge = 0;
    /** @type {number} */
    this._incidentVertex = 0;
};
/**
 * @return {number}
 */
Box2D.Collision.b2ContactID.prototype.GetKey = function () {
    return this._key;
};
/**
 * @param {number} key
 */
Box2D.Collision.b2ContactID.prototype.SetKey = function (key) {
    this._key = key;
    this._referenceEdge = this._key & 0x000000ff;
    this._incidentEdge = ((this._key & 0x0000ff00) >> 8) & 0x000000ff;
    this._incidentVertex = ((this._key & 0x00ff0000) >> 16) & 0x000000ff;
    this._flip = ((this._key & 0xff000000) >> 24) & 0x000000ff;
};
/**
 * @param {!Box2D.Collision.b2ContactID} id
 */
Box2D.Collision.b2ContactID.prototype.Set = function (id) {
    this.SetKey(id._key);
};
/**
 * @param {number} edge
 */
Box2D.Collision.b2ContactID.prototype.SetReferenceEdge = function(edge) {
    this._referenceEdge = edge;
    this._key = (this._key & 0xffffff00) | (this._referenceEdge & 0x000000ff);
};
/**
 * @param {number} edge
 */
Box2D.Collision.b2ContactID.prototype.SetIncidentEdge = function(edge) {
    this._incidentEdge = edge;
    this._key = (this._key & 0xffff00ff) | ((this._incidentEdge << 8) & 0x0000ff00);
};
/**
 * @param {number} vertex
 */
Box2D.Collision.b2ContactID.prototype.SetIncidentVertex = function(vertex) {
    this._incidentVertex = vertex;
    this._key = (this._key & 0xff00ffff) | ((this._incidentVertex << 16) & 0x00ff0000);
};
/**
 * @param {number} flip
 */
Box2D.Collision.b2ContactID.prototype.SetFlip = function(flip) {
    this._flip = flip;
    this._key = (this._key & 0x00ffffff) | ((this._flip << 24) & 0xff000000);
};
Box2D.Collision.b2ContactID.prototype.Copy = function () {
  var id = new Box2D.Collision.b2ContactID();
  id.Set(this);
  return id;
};
/**
 * @constructor
 */
Box2D.Collision.ClipVertex = function() {
    this.v = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.id = new Box2D.Collision.b2ContactID();
};
Box2D.Collision.ClipVertex.prototype.Set = function(other) {
    this.v.SetV(other.v);
    this.id.Set(other.id);
};
/**
 * @const
 * @type {string}
 */
Box2D.Collision.IBroadPhase = 'Box2D.Collision.IBroadPhase';
/**
 * @private
 * @constructor
 */
Box2D.Collision.b2AABB = function() {
    this.lowerBound_ = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.upperBound_ = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
/**
 * @private
 * @type {Array.<!Box2D.Collision.b2AABB>}
 */
Box2D.Collision.b2AABB._freeCache = [];
/**
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2AABB.Get = function() {
    if (Box2D.Collision.b2AABB._freeCache.length > 0) {
        var aabb = Box2D.Collision.b2AABB._freeCache.pop();
        aabb.SetZero();
        return aabb;
    }
    return new Box2D.Collision.b2AABB();
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Collision.b2AABB.Free = function(aabb) {
    Box2D.Collision.b2AABB._freeCache.push(aabb);
};
Box2D.Collision.b2AABB.prototype.SetZero = function() {
    this.lowerBound_.Set(0, 0);
    this.upperBound_.Set(0, 0);
};
/**
 * @return {boolean}
 */
Box2D.Collision.b2AABB.prototype.IsValid = function() {
    var dX = this.upperBound_.x - this.lowerBound_.x;
    if (dX < 0) {
        return false;
    }
    var dY = this.upperBound_.y - this.lowerBound_.y;
    if (dY < 0) {
        return false;
    }
    return this.lowerBound_.IsValid() && this.upperBound_.IsValid();
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.b2AABB.prototype.GetCenter = function() {
    return Box2D.Common.Math.b2Vec2.Get((this.lowerBound_.x + this.upperBound_.x) / 2, (this.lowerBound_.y + this.upperBound_.y) / 2);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} newCenter
 */
Box2D.Collision.b2AABB.prototype.SetCenter = function(newCenter) {
    var oldCenter = this.GetCenter();
    this.lowerBound_.Subtract(oldCenter);
    this.upperBound_.Subtract(oldCenter);
    this.lowerBound_.Add(newCenter);
    this.upperBound_.Add(newCenter);
    Box2D.Common.Math.b2Vec2.Free(oldCenter);
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Collision.b2AABB.prototype.GetExtents = function() {
    return Box2D.Common.Math.b2Vec2.Get((this.upperBound_.x - this.lowerBound_.x) / 2, (this.upperBound_.y - this.lowerBound_.y) / 2);
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @return {boolean}
 */
Box2D.Collision.b2AABB.prototype.Contains = function(aabb) {
    var result = true;
    result = result && this.lowerBound_.x <= aabb.lowerBound_.x;
    result = result && this.lowerBound_.y <= aabb.lowerBound_.y;
    result = result && aabb.upperBound_.x <= this.upperBound_.x;
    result = result && aabb.upperBound_.y <= this.upperBound_.y;
    return result;
};
/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @return {boolean}
 */
Box2D.Collision.b2AABB.prototype.RayCast = function(output, input) {
    var tmin = (-Number.MAX_VALUE);
    var tmax = Number.MAX_VALUE;
    var dX = input.p2.x - input.p1.x;
    var absDX = Math.abs(dX);
    if (absDX < Number.MIN_VALUE) {
        if (input.p1.x < this.lowerBound_.x || this.upperBound_.x < input.p1.x) {
            return false;
        }
    } else {
        var inv_d = 1.0 / dX;
        var t1 = (this.lowerBound_.x - input.p1.x) * inv_d;
        var t2 = (this.upperBound_.x - input.p1.x) * inv_d;
        var s = (-1.0);
        if (t1 > t2) {
            var t3 = t1;
            t1 = t2;
            t2 = t3;
            s = 1.0;
        }
        if (t1 > tmin) {
            output.normal.x = s;
            output.normal.y = 0;
            tmin = t1;
        }
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) return false;
    }
    var dY = input.p2.y - input.p1.y;
    var absDY = Math.abs(dY);
    if (absDY < Number.MIN_VALUE) {
        if (input.p1.y < this.lowerBound_.y || this.upperBound_.y < input.p1.y) {
            return false;
        }
    } else {
        var inv_d = 1.0 / dY;
        var t1 = (this.lowerBound_.y - input.p1.y) * inv_d;
        var t2 = (this.upperBound_.y - input.p1.y) * inv_d;
        var s = (-1.0);
        if (t1 > t2) {
            var t3 = t1;
            t1 = t2;
            t2 = t3;
            s = 1.0;
        }
        if (t1 > tmin) {
            output.normal.y = s;
            output.normal.x = 0;
            tmin = t1;
        }
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) {
            return false;
        }
    }
    output.fraction = tmin;
    return true;
};
/**
 * @param {!Box2D.Collision.b2AABB} other
 * @return {boolean}
 */
Box2D.Collision.b2AABB.prototype.TestOverlap = function(other) {
    if ( other.lowerBound_.x - this.upperBound_.x > 0 ) { return false; }
    if ( other.lowerBound_.y - this.upperBound_.y > 0 ) { return false; }
    if ( this.lowerBound_.x - other.upperBound_.x > 0 ) { return false; }
    if ( this.lowerBound_.y - other.upperBound_.y > 0 ) { return false; }
    return true;
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb1
 * @param {!Box2D.Collision.b2AABB} aabb2
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2AABB.Combine = function(aabb1, aabb2) {
    var aabb = Box2D.Collision.b2AABB.Get();
    aabb.Combine(aabb1, aabb2);
    return aabb;
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb1
 * @param {!Box2D.Collision.b2AABB} aabb2
 */
Box2D.Collision.b2AABB.prototype.Combine = function(aabb1, aabb2) {
    this.lowerBound_.x = Math.min(aabb1.lowerBound_.x, aabb2.lowerBound_.x);
    this.lowerBound_.y = Math.min(aabb1.lowerBound_.y, aabb2.lowerBound_.y);
    this.upperBound_.x = Math.max(aabb1.upperBound_.x, aabb2.upperBound_.x);
    this.upperBound_.y = Math.max(aabb1.upperBound_.y, aabb2.upperBound_.y);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} vOut
 * @param {!Box2D.Common.Math.b2Vec2} vIn
 * @param {!Box2D.Common.Math.b2Vec2} normal
 * @param {number} offset
 */
Box2D.Collision.b2Collision.ClipSegmentToLine = function(vOut, vIn, normal, offset) {
    var numOut = 0;
    var vIn0 = vIn[0].v;
    var vIn1 = vIn[1].v;
    var distance0 = normal.x * vIn0.x + normal.y * vIn0.y - offset;
    var distance1 = normal.x * vIn1.x + normal.y * vIn1.y - offset;
    if (distance0 <= 0.0) {
        vOut[numOut++].Set(vIn[0]);
    }
    if (distance1 <= 0.0) {
        vOut[numOut++].Set(vIn[1]);
    }
    if (distance0 * distance1 < 0.0) {
        var interp = distance0 / (distance0 - distance1);
        var tVec = vOut[numOut].v;
        tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
        tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
        if (distance0 > 0.0) {
            vOut[numOut].id = vIn[0].id;
        } else {
            vOut[numOut].id = vIn[1].id;
        }
        numOut++;
    }
    return numOut;
};
/**
 * @param {!Box2D.Collision.Shapes.b2PolygonShape} poly1
 * @param {!Box2D.Common.Math.b2Transform} xf1
 * @param {number} edge1
 * @param {!Box2D.Collision.Shapes.b2PolygonShape} poly2
 * @param {!Box2D.Common.Math.b2Transform} xf1
 * @return {number}
 */
Box2D.Collision.b2Collision.EdgeSeparation = function(poly1, xf1, edge1, poly2, xf2) {
    var normal1WorldX = (xf1.R.col1.x * poly1.m_normals[edge1].x + xf1.R.col2.x * poly1.m_normals[edge1].y);
    var normal1WorldY = (xf1.R.col1.y * poly1.m_normals[edge1].x + xf1.R.col2.y * poly1.m_normals[edge1].y);
    var normal1X = (xf2.R.col1.x * normal1WorldX + xf2.R.col1.y * normal1WorldY);
    var normal1Y = (xf2.R.col2.x * normal1WorldX + xf2.R.col2.y * normal1WorldY);
    var index = 0;
    var minDot = Number.MAX_VALUE;
    for (var i = 0; i < poly2.m_vertexCount; i++) {
        var dot = poly2.m_vertices[i].x * normal1X + poly2.m_vertices[i].y * normal1Y;
        if (dot < minDot) {
            minDot = dot;
            index = i;
        }
    }
    var v1X = xf1.position.x + (xf1.R.col1.x * poly1.m_vertices[edge1].x + xf1.R.col2.x * poly1.m_vertices[edge1].y);
    var v1Y = xf1.position.y + (xf1.R.col1.y * poly1.m_vertices[edge1].x + xf1.R.col2.y * poly1.m_vertices[edge1].y);
    var v2X = xf2.position.x + (xf2.R.col1.x * poly2.m_vertices[index].x + xf2.R.col2.x * poly2.m_vertices[index].y);
    var v2Y = xf2.position.y + (xf2.R.col1.y * poly2.m_vertices[index].x + xf2.R.col2.y * poly2.m_vertices[index].y);
    var separation = (v2X - v1X) * normal1WorldX + (v2Y - v1Y) * normal1WorldY;
    return separation;
};
/**
 * @param {!Box2D.Collision.Shapes.b2PolygonShape} poly1
 * @param {!Box2D.Common.Math.b2Transform} xf1
 * @param {!Box2D.Collision.Shapes.b2PolygonShape} poly2
 * @param {!Box2D.Common.Math.b2Transform} xf1
 * @return {{bestEdge: number, separation: number}}
 */
Box2D.Collision.b2Collision.FindMaxSeparation = function(poly1, xf1, poly2, xf2) {
    var dX = xf2.position.x + (xf2.R.col1.x * poly2.m_centroid.x + xf2.R.col2.x * poly2.m_centroid.y);
    var dY = xf2.position.y + (xf2.R.col1.y * poly2.m_centroid.x + xf2.R.col2.y * poly2.m_centroid.y);
    dX -= xf1.position.x + (xf1.R.col1.x * poly1.m_centroid.x + xf1.R.col2.x * poly1.m_centroid.y);
    dY -= xf1.position.y + (xf1.R.col1.y * poly1.m_centroid.x + xf1.R.col2.y * poly1.m_centroid.y);
    var dLocal1X = (dX * xf1.R.col1.x + dY * xf1.R.col1.y);
    var dLocal1Y = (dX * xf1.R.col2.x + dY * xf1.R.col2.y);
    var edge = 0;
    var maxDot = (-Number.MAX_VALUE);
    for (var i = 0; i < poly1.m_vertexCount; ++i) {
        var dot = (poly1.m_normals[i].x * dLocal1X + poly1.m_normals[i].y * dLocal1Y);
        if (dot > maxDot) {
            maxDot = dot;
            edge = i;
        }
    }
    var s = Box2D.Collision.b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
    var prevEdge = edge - 1;
    if (prevEdge < 0) {
        prevEdge = poly1.m_vertexCount - 1;
    }
    var sPrev = Box2D.Collision.b2Collision.EdgeSeparation(poly1, xf1, prevEdge, poly2, xf2);
    var nextEdge = edge + 1;
    if (nextEdge >= poly1.m_vertexCount) {
        nextEdge = 0;
    }
    var sNext = Box2D.Collision.b2Collision.EdgeSeparation(poly1, xf1, nextEdge, poly2, xf2);
    var bestEdge = 0;
    var bestSeparation = 0;
    if (sPrev > s && sPrev > sNext) {
        bestEdge = prevEdge;
        bestSeparation = sPrev;
        while (true) {
            edge = bestEdge - 1;
            if (edge < 0) {
                edge = poly1.m_vertexCount - 1;
            }
            s = Box2D.Collision.b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
            if (s > bestSeparation) {
                bestEdge = edge;
                bestSeparation = s;
            } else {
                break;
            }
        }
    } else if (sNext > s) {
        bestEdge = nextEdge;
        bestSeparation = sNext;
        while (true) {
            edge = bestEdge + 1;
            if (edge >= poly1.m_vertexCount) {
                edge = 0;
            }
            s = Box2D.Collision.b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
            if (s > bestSeparation) {
                bestEdge = edge;
                bestSeparation = s;
            } else {
                break;
            }
        }
    } else {
        bestEdge = edge;
        bestSeparation = s;
    }
    return {bestEdge: bestEdge, separation: bestSeparation};
};
Box2D.Collision.b2Collision.FindIncidentEdge = function(c, poly1, xf1, edge1, poly2, xf2) {
    if (edge1 === undefined) edge1 = 0;
    var normal1X = (xf1.R.col1.x * poly1.m_normals[edge1].x + xf1.R.col2.x * poly1.m_normals[edge1].y);
    var normal1Y = (xf1.R.col1.y * poly1.m_normals[edge1].x + xf1.R.col2.y * poly1.m_normals[edge1].y);
    var tX = (xf2.R.col1.x * normal1X + xf2.R.col1.y * normal1Y);
    normal1Y = (xf2.R.col2.x * normal1X + xf2.R.col2.y * normal1Y);
    normal1X = tX;
    var i1 = 0;
    var minDot = Number.MAX_VALUE;
    for (var i = 0; i < poly2.m_vertexCount; i++) {
        var dot = (normal1X * poly2.m_normals[i].x + normal1Y * poly2.m_normals[i].y);
        if (dot < minDot) {
            minDot = dot;
            i1 = i;
        }
    }
    var i2 = i1 + 1;
    if (i2 >= poly2.m_vertexCount) {
        i2 = 0;
    }
    c[0].v.x = xf2.position.x + (xf2.R.col1.x * poly2.m_vertices[i1].x + xf2.R.col2.x * poly2.m_vertices[i1].y);
    c[0].v.y = xf2.position.y + (xf2.R.col1.y * poly2.m_vertices[i1].x + xf2.R.col2.y * poly2.m_vertices[i1].y);
    c[0].id.SetReferenceEdge(edge1);
    c[0].id.SetIncidentEdge(i1);
    c[0].id.SetIncidentVertex(0);
    c[1].v.x = xf2.position.x + (xf2.R.col1.x * poly2.m_vertices[i2].x + xf2.R.col2.x * poly2.m_vertices[i2].y);
    c[1].v.y = xf2.position.y + (xf2.R.col1.y * poly2.m_vertices[i2].x + xf2.R.col2.y * poly2.m_vertices[i2].y);
    c[1].id.SetReferenceEdge(edge1);
    c[1].id.SetIncidentEdge(i2);
    c[1].id.SetIncidentVertex(1);
};
Box2D.Collision.b2Collision.MakeClipPointVector = function() {
    return [new Box2D.Collision.ClipVertex(), new Box2D.Collision.ClipVertex()];
};
Box2D.Collision.b2Collision.CollidePolygons = function(manifold, polyA, xfA, polyB, xfB) {
    manifold.m_pointCount = 0;
    var totalRadius = polyA.m_radius + polyB.m_radius;
    var separationEdgeA = Box2D.Collision.b2Collision.FindMaxSeparation(polyA, xfA, polyB, xfB);
    var edge1 = separationEdgeA.bestEdge;
    if (separationEdgeA.separation > totalRadius) {
        return;
    }
    var separationEdgeB = Box2D.Collision.b2Collision.FindMaxSeparation(polyB, xfB, polyA, xfA);
    if (separationEdgeB.separation > totalRadius) {
        return;
    }
    var poly1 = polyA;
    var poly2 = polyB;
    var xf1 = xfA;
    var xf2 = xfB;
    var flip = 0;
    manifold.m_type = Box2D.Collision.b2Manifold.e_faceA;
    if (separationEdgeB.separation > 0.98 /* k_relativeTol */ * separationEdgeA.separation + 0.001 /* k_absoluteTol */ ) {
        poly1 = polyB;
        poly2 = polyA;
        xf1 = xfB;
        xf2 = xfA;
        edge1 = separationEdgeB.bestEdge;
        manifold.m_type = Box2D.Collision.b2Manifold.e_faceB;
        flip = 1;
    }
    var incidentEdge = Box2D.Collision.b2Collision.s_incidentEdge;
    Box2D.Collision.b2Collision.FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
    var local_v11 = poly1.m_vertices[edge1];
    var local_v12;
    if (edge1 + 1 < poly1.m_vertexCount) {
        local_v12 = poly1.m_vertices[edge1 + 1];
    } else {
        local_v12 = poly1.m_vertices[0];
    }
    Box2D.Collision.b2Collision.s_localTangent.Set(local_v12.x - local_v11.x, local_v12.y - local_v11.y);
    Box2D.Collision.b2Collision.s_localTangent.Normalize();
    Box2D.Collision.b2Collision.s_localNormal.x = Box2D.Collision.b2Collision.s_localTangent.y;
    Box2D.Collision.b2Collision.s_localNormal.y = (-Box2D.Collision.b2Collision.s_localTangent.x);
    Box2D.Collision.b2Collision.s_planePoint.Set(0.5 * (local_v11.x + local_v12.x), 0.5 * (local_v11.y + local_v12.y));
    Box2D.Collision.b2Collision.s_tangent.x = (xf1.R.col1.x * Box2D.Collision.b2Collision.s_localTangent.x + xf1.R.col2.x * Box2D.Collision.b2Collision.s_localTangent.y);
    Box2D.Collision.b2Collision.s_tangent.y = (xf1.R.col1.y * Box2D.Collision.b2Collision.s_localTangent.x + xf1.R.col2.y * Box2D.Collision.b2Collision.s_localTangent.y);
    Box2D.Collision.b2Collision.s_tangent2.x = (-Box2D.Collision.b2Collision.s_tangent.x);
    Box2D.Collision.b2Collision.s_tangent2.y = (-Box2D.Collision.b2Collision.s_tangent.y);
    Box2D.Collision.b2Collision.s_normal.x = Box2D.Collision.b2Collision.s_tangent.y;
    Box2D.Collision.b2Collision.s_normal.y = (-Box2D.Collision.b2Collision.s_tangent.x);
    Box2D.Collision.b2Collision.s_v11.x = xf1.position.x + (xf1.R.col1.x * local_v11.x + xf1.R.col2.x * local_v11.y);
    Box2D.Collision.b2Collision.s_v11.y = xf1.position.y + (xf1.R.col1.y * local_v11.x + xf1.R.col2.y * local_v11.y);
    Box2D.Collision.b2Collision.s_v12.x = xf1.position.x + (xf1.R.col1.x * local_v12.x + xf1.R.col2.x * local_v12.y);
    Box2D.Collision.b2Collision.s_v12.y = xf1.position.y + (xf1.R.col1.y * local_v12.x + xf1.R.col2.y * local_v12.y);
    var sideOffset1 = (-Box2D.Collision.b2Collision.s_tangent.x * Box2D.Collision.b2Collision.s_v11.x) - Box2D.Collision.b2Collision.s_tangent.y * Box2D.Collision.b2Collision.s_v11.y + totalRadius;
    if (Box2D.Collision.b2Collision.ClipSegmentToLine(Box2D.Collision.b2Collision.s_clipPoints1, incidentEdge, Box2D.Collision.b2Collision.s_tangent2, sideOffset1) < 2) {
        return;
    }
    var sideOffset2 = Box2D.Collision.b2Collision.s_tangent.x * Box2D.Collision.b2Collision.s_v12.x + Box2D.Collision.b2Collision.s_tangent.y * Box2D.Collision.b2Collision.s_v12.y + totalRadius;
    if (Box2D.Collision.b2Collision.ClipSegmentToLine(Box2D.Collision.b2Collision.s_clipPoints2, Box2D.Collision.b2Collision.s_clipPoints1, Box2D.Collision.b2Collision.s_tangent, sideOffset2) < 2) {
        return;
    }
    manifold.m_localPlaneNormal.SetV(Box2D.Collision.b2Collision.s_localNormal);
    manifold.m_localPoint.SetV(Box2D.Collision.b2Collision.s_planePoint);
    var frontOffset = Box2D.Collision.b2Collision.s_normal.x * Box2D.Collision.b2Collision.s_v11.x + Box2D.Collision.b2Collision.s_normal.y * Box2D.Collision.b2Collision.s_v11.y;
    var pointCount = 0;
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; ++i) {
        var separation = Box2D.Collision.b2Collision.s_normal.x * Box2D.Collision.b2Collision.s_clipPoints2[i].v.x + Box2D.Collision.b2Collision.s_normal.y * Box2D.Collision.b2Collision.s_clipPoints2[i].v.y - frontOffset;
        if (separation <= totalRadius) {
            var tX = Box2D.Collision.b2Collision.s_clipPoints2[i].v.x - xf2.position.x;
            var tY = Box2D.Collision.b2Collision.s_clipPoints2[i].v.y - xf2.position.y;
            manifold.m_points[pointCount].m_localPoint.x = (tX * xf2.R.col1.x + tY * xf2.R.col1.y);
            manifold.m_points[pointCount].m_localPoint.y = (tX * xf2.R.col2.x + tY * xf2.R.col2.y);
            manifold.m_points[pointCount].m_id.Set(Box2D.Collision.b2Collision.s_clipPoints2[i].id);
            manifold.m_points[pointCount].m_id.SetFlip(flip);
            pointCount++;
        }
    }
    manifold.m_pointCount = pointCount;
};
Box2D.Collision.b2Collision.CollideCircles = function(manifold, circle1, xf1, circle2, xf2) {
    manifold.m_pointCount = 0;
    var p1X = xf1.position.x + (xf1.R.col1.x * circle1.m_p.x + xf1.R.col2.x * circle1.m_p.y);
    var p1Y = xf1.position.y + (xf1.R.col1.y * circle1.m_p.x + xf1.R.col2.y * circle1.m_p.y);
    var p2X = xf2.position.x + (xf2.R.col1.x * circle2.m_p.x + xf2.R.col2.x * circle2.m_p.y);
    var p2Y = xf2.position.y + (xf2.R.col1.y * circle2.m_p.x + xf2.R.col2.y * circle2.m_p.y);
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var distSqr = dX * dX + dY * dY;
    var radius = circle1.m_radius + circle2.m_radius;
    if (distSqr > radius * radius) {
        return;
    }
    manifold.m_type = Box2D.Collision.b2Manifold.e_circles;
    manifold.m_localPoint.SetV(circle1.m_p);
    manifold.m_localPlaneNormal.SetZero();
    manifold.m_pointCount = 1;
    manifold.m_points[0].m_localPoint.SetV(circle2.m_p);
    manifold.m_points[0].m_id.SetKey(0);
};
Box2D.Collision.b2Collision.CollidePolygonAndCircle = function(manifold, polygon, xf1, circle, xf2) {
    manifold.m_pointCount = 0;
    var dX = xf2.position.x + (xf2.R.col1.x * circle.m_p.x + xf2.R.col2.x * circle.m_p.y) - xf1.position.x;
    var dY = xf2.position.y + (xf2.R.col1.y * circle.m_p.x + xf2.R.col2.y * circle.m_p.y) - xf1.position.y;
    var cLocalX = (dX * xf1.R.col1.x + dY * xf1.R.col1.y);
    var cLocalY = (dX * xf1.R.col2.x + dY * xf1.R.col2.y);
    var normalIndex = 0;
    var separation = (-Number.MAX_VALUE);
    var radius = polygon.m_radius + circle.m_radius;
    for (var i = 0; i < polygon.m_vertexCount; ++i) {
        var s = polygon.m_normals[i].x * (cLocalX - polygon.m_vertices[i].x) + polygon.m_normals[i].y * (cLocalY - polygon.m_vertices[i].y);
        if (s > radius) {
            return;
        }
        if (s > separation) {
            separation = s;
            normalIndex = i;
        }
    }
    var vertIndex2 = normalIndex + 1;
    if (vertIndex2 >= polygon.m_vertexCount) {
        vertIndex2 = 0;
    }
    var v1 = polygon.m_vertices[normalIndex];
    var v2 = polygon.m_vertices[vertIndex2];
    if (separation < Number.MIN_VALUE) {
        manifold.m_pointCount = 1;
        manifold.m_type = Box2D.Collision.b2Manifold.e_faceA;
        manifold.m_localPlaneNormal.SetV(polygon.m_normals[normalIndex]);
        manifold.m_localPoint.x = 0.5 * (v1.x + v2.x);
        manifold.m_localPoint.y = 0.5 * (v1.y + v2.y);
        manifold.m_points[0].m_localPoint.SetV(circle.m_p);
        manifold.m_points[0].m_id.SetKey(0);
    } else {
        var u1 = (cLocalX - v1.x) * (v2.x - v1.x) + (cLocalY - v1.y) * (v2.y - v1.y);
        if (u1 <= 0.0) {
            if ((cLocalX - v1.x) * (cLocalX - v1.x) + (cLocalY - v1.y) * (cLocalY - v1.y) > radius * radius) return;
            manifold.m_pointCount = 1;
            manifold.m_type = Box2D.Collision.b2Manifold.e_faceA;
            manifold.m_localPlaneNormal.x = cLocalX - v1.x;
            manifold.m_localPlaneNormal.y = cLocalY - v1.y;
            manifold.m_localPlaneNormal.Normalize();
            manifold.m_localPoint.SetV(v1);
            manifold.m_points[0].m_localPoint.SetV(circle.m_p);
            manifold.m_points[0].m_id.SetKey(0);
        } else {
            var u2 = (cLocalX - v2.x) * (v1.x - v2.x) + (cLocalY - v2.y) * (v1.y - v2.y);
            if (u2 <= 0) {
                if ((cLocalX - v2.x) * (cLocalX - v2.x) + (cLocalY - v2.y) * (cLocalY - v2.y) > radius * radius) return;
                manifold.m_pointCount = 1;
                manifold.m_type = Box2D.Collision.b2Manifold.e_faceA;
                manifold.m_localPlaneNormal.x = cLocalX - v2.x;
                manifold.m_localPlaneNormal.y = cLocalY - v2.y;
                manifold.m_localPlaneNormal.Normalize();
                manifold.m_localPoint.SetV(v2);
                manifold.m_points[0].m_localPoint.SetV(circle.m_p);
                manifold.m_points[0].m_id.SetKey(0);
            } else {
                var faceCenterX = 0.5 * (v1.x + v2.x);
                var faceCenterY = 0.5 * (v1.y + v2.y);
                separation = (cLocalX - faceCenterX) * polygon.m_normals[normalIndex].x + (cLocalY - faceCenterY) * polygon.m_normals[normalIndex].y;
                if (separation > radius) return;
                manifold.m_pointCount = 1;
                manifold.m_type = Box2D.Collision.b2Manifold.e_faceA;
                manifold.m_localPlaneNormal.x = polygon.m_normals[normalIndex].x;
                manifold.m_localPlaneNormal.y = polygon.m_normals[normalIndex].y;
                manifold.m_localPlaneNormal.Normalize();
                manifold.m_localPoint.Set(faceCenterX, faceCenterY);
                manifold.m_points[0].m_localPoint.SetV(circle.m_p);
                manifold.m_points[0].m_id.SetKey(0);
            }
        }
    }
};
Box2D.Collision.b2Collision.TestOverlap = function(a, b) {
    if (b.lowerBound_.x - a.upperBound_.x > 0) {
        return false;
    }
    if (b.lowerBound_.y - a.upperBound_.y > 0) {
        return false;
    }
    if (a.lowerBound_.x - b.upperBound_.x > 0) {
        return false;
    }
    if (a.lowerBound_.y - b.upperBound_.y > 0) {
        return false;
    }
    return true;
};
/**
 * @constructor
 */
Box2D.Collision.b2ContactPoint = function() {
    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.velocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.id = new Box2D.Collision.b2ContactID();
};
/**
 * @param {!Box2D.Collision.b2DistanceOutput} output
 * @param {!Box2D.Collision.b2SimplexCache} cache
 * @param {!Box2D.Collision.b2DistanceInput} input
 */
Box2D.Collision.b2Distance.Distance = function(output, cache, input) {
    var s_simplex = new Box2D.Collision.b2Simplex();
    s_simplex.ReadCache(cache, input.proxyA, input.transformA, input.proxyB, input.transformB);
    if (s_simplex.m_count < 1 || s_simplex.m_count > 3) {
;
    }
    var iter = 0;
    while (iter < 20) {
        var save = [];
        for (var i = 0; i < s_simplex.m_count; i++) {
            save[i] = {};
            save[i].indexA = s_simplex.m_vertices[i].indexA;
            save[i].indexB = s_simplex.m_vertices[i].indexB;
        }
        if (s_simplex.m_count == 2) {
            s_simplex.Solve2();
        } else if (s_simplex.m_count == 3) {
            s_simplex.Solve3();
        }
        if (s_simplex.m_count == 3) {
            break;
        }
        var d = s_simplex.GetSearchDirection();
        if (d.LengthSquared() < Box2D.Common.b2Settings.MIN_VALUE_SQUARED) {
            break;
        }
        var negD = d.GetNegative();
        s_simplex.m_vertices[s_simplex.m_count].indexA = input.proxyA.GetSupport(Box2D.Common.Math.b2Math.MulTMV(input.transformA.R, negD));
        s_simplex.m_vertices[s_simplex.m_count].wA = Box2D.Common.Math.b2Math.MulX(input.transformA, input.proxyA.GetVertex(s_simplex.m_vertices[s_simplex.m_count].indexA));
        s_simplex.m_vertices[s_simplex.m_count].indexB = input.proxyB.GetSupport(Box2D.Common.Math.b2Math.MulTMV(input.transformB.R, d));
        s_simplex.m_vertices[s_simplex.m_count].wB = Box2D.Common.Math.b2Math.MulX(input.transformB, input.proxyB.GetVertex(s_simplex.m_vertices[s_simplex.m_count].indexB));
        s_simplex.m_vertices[s_simplex.m_count].w = Box2D.Common.Math.b2Math.SubtractVV(s_simplex.m_vertices[s_simplex.m_count].wB, s_simplex.m_vertices[s_simplex.m_count].wA);
        Box2D.Common.Math.b2Vec2.Free(d);
        Box2D.Common.Math.b2Vec2.Free(negD);
        iter++;
        var duplicate = false;
        for (var i = 0; i < save.length; i++) {
            if (s_simplex.m_vertices[s_simplex.m_count].indexA == save[i].indexA && s_simplex.m_vertices[s_simplex.m_count].indexB == save[i].indexB) {
                duplicate = true;
                break;
            }
        }
        if (duplicate) {
            break;
        }
        s_simplex.m_count++;
    }
    s_simplex.GetWitnessPoints(output.pointA, output.pointB);
    output.distance = Box2D.Common.Math.b2Math.SubtractVV(output.pointA, output.pointB).Length();
    s_simplex.WriteCache(cache);
    if (input.useRadii) {
        var rA = input.proxyA.m_radius;
        var rB = input.proxyB.m_radius;
        if (output.distance > rA + rB && output.distance > Number.MIN_VALUE) {
            output.distance -= rA + rB;
            var normal = Box2D.Common.Math.b2Math.SubtractVV(output.pointB, output.pointA);
            normal.Normalize();
            output.pointA.x += rA * normal.x;
            output.pointA.y += rA * normal.y;
            output.pointB.x -= rB * normal.x;
            output.pointB.y -= rB * normal.y;
            Box2D.Common.Math.b2Vec2.Free(normal);
        } else {
            var p = Box2D.Common.Math.b2Vec2.Get(0, 0);
            p.x = 0.5 * (output.pointA.x + output.pointB.x);
            p.y = 0.5 * (output.pointA.y + output.pointB.y);
            output.pointA.x = output.pointB.x = p.x;
            output.pointA.y = output.pointB.y = p.y;
            output.distance = 0.0;
            Box2D.Common.Math.b2Vec2.Free(p);
        }
    }
};
/**
 * @constructor
 */
Box2D.Collision.b2DistanceInput = function () {};
/**
 * @constructor
 */
Box2D.Collision.b2DistanceOutput = function () {
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.pointA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.pointB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    /** @type {number} */
    this.distance = 0;
};
/**
 * @constructor
 */
Box2D.Collision.b2DistanceProxy = function() {};
Box2D.Collision.b2DistanceProxy.prototype.Set = function (shape) {
    shape.SetDistanceProxy(this);
};
Box2D.Collision.b2DistanceProxy.prototype.GetSupport = function (d) {
    var bestIndex = 0;
    var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
    for (var i = 1; i < this.m_count; i++) {
        var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
        if (value > bestValue) {
            bestIndex = i;
            bestValue = value;
        }
    }
    return bestIndex;
};
Box2D.Collision.b2DistanceProxy.prototype.GetSupportVertex = function (d) {
    return this.m_vertices[this.GetSupport(d)];
};
Box2D.Collision.b2DistanceProxy.prototype.GetVertexCount = function () {
    return this.m_count;
};
Box2D.Collision.b2DistanceProxy.prototype.GetVertex = function (index) {
    if (index === undefined) index = 0;
;
    return this.m_vertices[index];
};
/**
 * @constructor
 */
Box2D.Collision.b2DynamicTree = function() {
    /** @type {Box2D.Collision.b2DynamicTreeNode} */
    this.m_root = null;
    /** @type {number} */
    this.m_path = 0;
    /** @type {number} */
    this.m_insertionCount = 0;
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {Box2D.Dynamics.b2Fixture} fixture
 * @return {!Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTree.prototype.CreateProxy = function(aabb, fixture) {
    var node = Box2D.Collision.b2DynamicTreeNode.Get(fixture);
    var extendX = Box2D.Common.b2Settings.b2_aabbExtension;
    var extendY = Box2D.Common.b2Settings.b2_aabbExtension;
    node.aabb.lowerBound_.x = aabb.lowerBound_.x - extendX;
    node.aabb.lowerBound_.y = aabb.lowerBound_.y - extendY;
    node.aabb.upperBound_.x = aabb.upperBound_.x + extendX;
    node.aabb.upperBound_.y = aabb.upperBound_.y + extendY;
    this.InsertLeaf(node);
    return node;
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 */
Box2D.Collision.b2DynamicTree.prototype.DestroyProxy = function(proxy) {
    this.RemoveLeaf(proxy);
    proxy.Destroy();
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Vec2} displacement
 * @return {boolean}
 */
Box2D.Collision.b2DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement) {
;
    if (proxy.aabb.Contains(aabb)) {
        return false;
    }
    this.RemoveLeaf(proxy);
    var extendX = Box2D.Common.b2Settings.b2_aabbExtension + Box2D.Common.b2Settings.b2_aabbMultiplier * Math.abs(displacement.x);
    var extendY = Box2D.Common.b2Settings.b2_aabbExtension + Box2D.Common.b2Settings.b2_aabbMultiplier * Math.abs(displacement.y);
    proxy.aabb.lowerBound_.x = aabb.lowerBound_.x - extendX;
    proxy.aabb.lowerBound_.y = aabb.lowerBound_.y - extendY;
    proxy.aabb.upperBound_.x = aabb.upperBound_.x + extendX;
    proxy.aabb.upperBound_.y = aabb.upperBound_.y + extendY;
    this.InsertLeaf(proxy);
    return true;
};
/**
 * @param {number} iterations
 */
Box2D.Collision.b2DynamicTree.prototype.Rebalance = function(iterations) {
    if (this.m_root !== null) {
        for (var i = 0; i < iterations; i++) {
            var node = this.m_root;
            var bit = 0;
            while (!node.IsLeaf()) {
                node = (this.m_path >> bit) & 1 ? node.child2 : node.child1;
                bit = (bit + 1) & 31;
            }
            this.m_path++;
            this.RemoveLeaf(node);
            this.InsertLeaf(node);
        }
    }
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2DynamicTree.prototype.GetFatAABB = function(proxy) {
    return proxy.aabb;
};
/**
 * @param {function(!Box2D.Dynamics.b2Fixture): boolean} callback
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Collision.b2DynamicTree.prototype.Query = function(callback, aabb) {
    if (this.m_root !== null) {
        var stack = [];
        stack.push(this.m_root);
        while (stack.length > 0) {
            var node = stack.pop();
            if (node.aabb.TestOverlap(aabb)) {
                if (node.IsLeaf()) {
                    if (!callback(node.fixture)) {
                        return;
                    }
                } else {
                    stack.push(node.child1);
                    stack.push(node.child2);
                }
            }
        }
    }
};
/**
 * @param {function(!Box2D.Collision.b2RayCastInput, !Box2D.Dynamics.b2Fixture): number} callback
 * @param {!Box2D.Collision.b2RayCastInput} input
 */
Box2D.Collision.b2DynamicTree.prototype.RayCast = function(callback, input) {
    if (this.m_root === null) {
        return;
    }
    var r = Box2D.Common.Math.b2Math.SubtractVV(input.p1, input.p2);
    r.Normalize();
    var v = Box2D.Common.Math.b2Math.CrossFV(1.0, r);
    var abs_v = Box2D.Common.Math.b2Math.AbsV(v);
    var maxFraction = input.maxFraction;
    var tX = input.p1.x + maxFraction * (input.p2.x - input.p1.x);
    var tY = input.p1.y + maxFraction * (input.p2.y - input.p1.y);
    var segmentAABB = Box2D.Collision.b2AABB.Get();
    segmentAABB.lowerBound_.x = Math.min(input.p1.x, tX);
    segmentAABB.lowerBound_.y = Math.min(input.p1.y, tY);
    segmentAABB.upperBound_.x = Math.max(input.p1.x, tX);
    segmentAABB.upperBound_.y = Math.max(input.p1.y, tY);
    var stack = [];
    stack.push(this.m_root);
    while (stack.length > 0) {
        var node = stack.pop();
        if (!node.aabb.TestOverlap(segmentAABB)) {
            continue;
        }
        var c = node.aabb.GetCenter();
        var h = node.aabb.GetExtents();
        var separation = Math.abs(v.x * (input.p1.x - c.x) + v.y * (input.p1.y - c.y)) - abs_v.x * h.x - abs_v.y * h.y;
        if (separation > 0.0) {
            continue;
        }
        if (node.IsLeaf()) {
            var subInput = new Box2D.Collision.b2RayCastInput(input.p1, input.p2, input.maxFraction);
            maxFraction = callback(input, node.fixture);
            if (maxFraction == 0.0) {
                break;
            }
            if (maxFraction > 0.0) {
                tX = input.p1.x + maxFraction * (input.p2.x - input.p1.x);
                tY = input.p1.y + maxFraction * (input.p2.y - input.p1.y);
                segmentAABB.lowerBound_.x = Math.min(input.p1.x, tX);
                segmentAABB.lowerBound_.y = Math.min(input.p1.y, tY);
                segmentAABB.upperBound_.x = Math.max(input.p1.x, tX);
                segmentAABB.upperBound_.y = Math.max(input.p1.y, tY);
            }
        } else {
            stack.push(node.child1);
            stack.push(node.child2);
        }
    }
    Box2D.Collision.b2AABB.Free(segmentAABB);
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} leaf
 */
Box2D.Collision.b2DynamicTree.prototype.InsertLeaf = function(leaf) {
    this.m_insertionCount++;
    if (this.m_root === null) {
        this.m_root = leaf;
        this.m_root.parent = null;
        return;
    }
    var sibling = this.GetBestSibling(leaf);
    var parent = sibling.parent;
    var node2 = Box2D.Collision.b2DynamicTreeNode.Get();
    node2.parent = parent;
    node2.aabb.Combine(leaf.aabb, sibling.aabb);
    if (parent) {
        if (sibling.parent.child1 == sibling) {
            parent.child1 = node2;
        } else {
            parent.child2 = node2;
        }
        node2.child1 = sibling;
        node2.child2 = leaf;
        sibling.parent = node2;
        leaf.parent = node2;
        while (parent) {
            if (parent.aabb.Contains(node2.aabb)) {
                break;
            }
            parent.aabb.Combine(parent.child1.aabb, parent.child2.aabb);
            node2 = parent;
            parent = parent.parent;
        }
    } else {
        node2.child1 = sibling;
        node2.child2 = leaf;
        sibling.parent = node2;
        leaf.parent = node2;
        this.m_root = node2;
    }
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} leaf
 * @return {!Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTree.prototype.GetBestSibling = function(leaf) {
    var center = leaf.aabb.GetCenter();
    var sibling = this.m_root;
    while(!sibling.IsLeaf()) {
        var child1 = sibling.child1;
        var child2 = sibling.child2;
        var norm1 = Math.abs((child1.aabb.lowerBound_.x + child1.aabb.upperBound_.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound_.y + child1.aabb.upperBound_.y) / 2 - center.y);
        var norm2 = Math.abs((child2.aabb.lowerBound_.x + child2.aabb.upperBound_.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound_.y + child2.aabb.upperBound_.y) / 2 - center.y);
        if (norm1 < norm2) {
            sibling = child1;
        } else {
            sibling = child2;
        }
    }
    Box2D.Common.Math.b2Vec2.Free(center);
    return sibling;
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} leaf
 */
Box2D.Collision.b2DynamicTree.prototype.RemoveLeaf = function(leaf) {
    if (leaf == this.m_root) {
        this.m_root = null;
        return;
    }
    var node2 = leaf.parent;
    var node1 = node2.parent;
    var sibling;
    if (node2.child1 == leaf) {
        sibling = node2.child2;
    } else {
        sibling = node2.child1;
    }
    if (node1) {
        if (node1.child1 == node2) {
            node1.child1 = sibling;
        } else {
            node1.child2 = sibling;
        }
        sibling.parent = node1;
        while (node1) {
            var oldAABB = node1.aabb;
            node1.aabb.Combine(node1.child1.aabb, node1.child2.aabb);
            if (oldAABB.Contains(node1.aabb)) {
                break;
            }
            node1 = node1.parent;
        }
    } else {
        this.m_root = sibling;
        sibling.parent = null;
    }
    node2.Destroy();
};
/**
 * @constructor
 */
Box2D.Collision.b2DynamicTreeBroadPhase = function() {
    /**
     * @private
     * @type {!Box2D.Collision.b2DynamicTree}
     */
    this.m_tree = new Box2D.Collision.b2DynamicTree();
    /**
     * @private
     * @type {Array.<!Box2D.Collision.b2DynamicTreeNode>}
     */
    this.m_moveBuffer = [];
};
/**
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {Box2D.Dynamics.b2Fixture} fixture
 * @return {!Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.CreateProxy = function(aabb, fixture) {
    var proxy = this.m_tree.CreateProxy(aabb, fixture);
    this.BufferMove(proxy);
    return proxy;
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.DestroyProxy = function(proxy) {
    this.UnBufferMove(proxy);
    this.m_tree.DestroyProxy(proxy);
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 * @param {!Box2D.Collision.b2AABB} aabb
 * @param {!Box2D.Common.Math.b2Vec2} displacement
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.MoveProxy = function(proxy, aabb, displacement) {
    var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
    if (buffer) {
        this.BufferMove(proxy);
    }
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxyA
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxyB
 * @return {boolean}
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
    var aabbA = this.m_tree.GetFatAABB(proxyA);
    var aabbB = this.m_tree.GetFatAABB(proxyB);
    return aabbA.TestOverlap(aabbB);
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeNode} proxy
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.GetFatAABB = function(proxy) {
    return this.m_tree.GetFatAABB(proxy);
};
/**
 * @return {number}
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.GetProxyCount = function() {
    return this.m_tree.length;
};
/**
 * @param {function(!Box2D.Dynamics.b2Fixture, !Box2D.Dynamics.b2Fixture)} callback
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.UpdatePairs = function(callback) {
    var __this = this;
    var pairs = [];
    while (this.m_moveBuffer.length > 0) {
        var queryProxy = this.m_moveBuffer.pop();
        var QueryCallback = function(fixture) {
            if (fixture != queryProxy.fixture) {
                pairs.push(new Box2D.Collision.b2DynamicTreePair(queryProxy.fixture, fixture));
            }
            return true;
        };
        var fatAABB = this.m_tree.GetFatAABB(queryProxy);
        this.m_tree.Query(QueryCallback, fatAABB);
    }
    var i = 0;
    while(i < pairs.length) {
        var primaryPair = pairs[i];
        callback(primaryPair.fixtureA, primaryPair.fixtureB);
        i++;
        while(i < pairs.length) {
            var pair = pairs[i];
            if (!(pair.fixtureA == primaryPair.fixtureA && pair.fixtureB == primaryPair.fixtureB)
                && !(pair.fixtureA == primaryPair.fixtureB && pair.fixtureB == primaryPair.fixtureA)) {
                break;
            }
            i++;
        }
    }
};
/**
 * @param {function(!Box2D.Dynamics.b2Fixture): boolean} callback
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.Query = function(callback, aabb) {
    this.m_tree.Query(callback, aabb);
};
/**
 * @param {function(!Box2D.Collision.b2RayCastInput, !Box2D.Dynamics.b2Fixture): number} callback
 * @param {!Box2D.Collision.b2RayCastInput} input
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.RayCast = function(callback, input) {
    this.m_tree.RayCast(callback, input);
};
/**
 * @param {number} iterations
 */
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.Rebalance = function(iterations) {
    this.m_tree.Rebalance(iterations);
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.BufferMove = function(proxy) {
    this.m_moveBuffer.push(proxy);
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.UnBufferMove = function(proxy) {
    cr.arrayFindRemove(this.m_moveBuffer, proxy);
};
Box2D.Collision.b2DynamicTreeBroadPhase.__implements = {};
Box2D.Collision.b2DynamicTreeBroadPhase.__implements[Box2D.Collision.IBroadPhase] = true;
/**
 * @private
 * @param {Box2D.Dynamics.b2Fixture=} fixture
 * @constructor
 */
Box2D.Collision.b2DynamicTreeNode = function(fixture) {
    /** @type {!Box2D.Collision.b2AABB} */
    this.aabb = Box2D.Collision.b2AABB.Get();
    /** @type {Box2D.Collision.b2DynamicTreeNode} */
    this.child1 = null;
    /** @type {Box2D.Collision.b2DynamicTreeNode} */
    this.child2 = null;
    /** @type {Box2D.Collision.b2DynamicTreeNode} */
    this.parent = null;
    /** @type {Box2D.Dynamics.b2Fixture} */
    this.fixture = null;
    if (typeof(fixture) != "undefined") {
        this.fixture = fixture;
    }
};
/**
 * @private
 * @type {Array.<!Box2D.Collision.b2DynamicTreeNode>}
 */
Box2D.Collision.b2DynamicTreeNode._freeCache = [];
/**
 * @param {Box2D.Dynamics.b2Fixture=} fixture
 * @return {!Box2D.Collision.b2DynamicTreeNode}
 */
Box2D.Collision.b2DynamicTreeNode.Get = function(fixture) {
    if (Box2D.Collision.b2DynamicTreeNode._freeCache.length > 0) {
        var node = Box2D.Collision.b2DynamicTreeNode._freeCache.pop();
        if (typeof(fixture) != "undefined") {
            node.fixture = fixture;
        }
        node.aabb.SetZero();
        return node;
    }
    return new Box2D.Collision.b2DynamicTreeNode(fixture);
};
Box2D.Collision.b2DynamicTreeNode.prototype.Destroy = function() {
    this.child1 = null;
    this.child2 = null;
    this.parent = null;
    this.fixture = null;
    Box2D.Collision.b2DynamicTreeNode._freeCache.push(this);
};
/**
 * @return boolean
 */
Box2D.Collision.b2DynamicTreeNode.prototype.IsLeaf = function () {
    return this.child1 === null;
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 */
Box2D.Collision.b2DynamicTreePair = function(fixtureA, fixtureB) {
    /** @type {!Box2D.Dynamics.b2Fixture} */
    this.fixtureA = fixtureA;
    /** @type {!Box2D.Dynamics.b2Fixture} */
    this.fixtureB = fixtureB;
};
/**
 * @constructor
 */
Box2D.Collision.b2Manifold = function() {
    this.m_pointCount = 0;
    this.m_type = 0;
    this.m_points = [];
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; i++) {
        this.m_points[i] = new Box2D.Collision.b2ManifoldPoint();
    }
    this.m_localPlaneNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
Box2D.Collision.b2Manifold.prototype.Reset = function() {
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; i++) {
        this.m_points[i].Reset();
    }
    this.m_localPlaneNormal.SetZero();
    this.m_localPoint.SetZero();
    this.m_type = 0;
    this.m_pointCount = 0;
};
Box2D.Collision.b2Manifold.prototype.Set = function(m) {
    this.m_pointCount = m.m_pointCount;
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; i++) {
        this.m_points[i].Set(m.m_points[i]);
    }
    this.m_localPlaneNormal.SetV(m.m_localPlaneNormal);
    this.m_localPoint.SetV(m.m_localPoint);
    this.m_type = m.m_type;
};
Box2D.Collision.b2Manifold.prototype.Copy = function() {
    var copy = new Box2D.Collision.b2Manifold();
    copy.Set(this);
    return copy;
};
Box2D.Collision.b2Manifold.e_circles = 0x0001;
Box2D.Collision.b2Manifold.e_faceA = 0x0002;
Box2D.Collision.b2Manifold.e_faceB = 0x0004;
/**
 * @constructor
 */
Box2D.Collision.b2ManifoldPoint = function() {
    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_id = new Box2D.Collision.b2ContactID();
    this.Reset();
};
Box2D.Collision.b2ManifoldPoint.prototype.Reset = function() {
    this.m_localPoint.SetZero();
    this.m_normalImpulse = 0.0;
    this.m_tangentImpulse = 0.0;
    this.m_id.SetKey(0);
};
Box2D.Collision.b2ManifoldPoint.prototype.Set = function(m) {
    this.m_localPoint.SetV(m.m_localPoint);
    this.m_normalImpulse = m.m_normalImpulse;
    this.m_tangentImpulse = m.m_tangentImpulse;
    this.m_id.Set(m.m_id);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} p1
 * @param {!Box2D.Common.Math.b2Vec2} p2
 * @param {number} maxFraction
 * @constructor
 */
Box2D.Collision.b2RayCastInput = function(p1, p2, maxFraction) {
      this.p1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
      this.p2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
      if (maxFraction === undefined) maxFraction = 1;
      if (p1) this.p1.SetV(p1);
      if (p2) this.p2.SetV(p2);
      this.maxFraction = maxFraction;
};
/**
 * @constructor
 */
Box2D.Collision.b2RayCastOutput = function() {
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
/**
 * @constructor
 */
Box2D.Collision.b2Segment = function() {
    this.p1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.p2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
Box2D.Collision.b2Segment.prototype.TestSegment = function(lambda, normal, segment, maxLambda) {
    if (maxLambda === undefined) maxLambda = 0;
    var s = segment.p1;
    var rX = segment.p2.x - s.x;
    var rY = segment.p2.y - s.y;
    var dX = this.p2.x - this.p1.x;
    var dY = this.p2.y - this.p1.y;
    var nX = dY;
    var nY = (-dX);
    var k_slop = 100.0 * Number.MIN_VALUE;
    var denom = (-(rX * nX + rY * nY));
    if (denom > k_slop) {
        var bX = s.x - this.p1.x;
        var bY = s.y - this.p1.y;
        var a = (bX * nX + bY * nY);
        if (0.0 <= a && a <= maxLambda * denom) {
            var mu2 = (-rX * bY) + rY * bX;
            if ((-k_slop * denom) <= mu2 && mu2 <= denom * (1.0 + k_slop)) {
                a /= denom;
                var nLen = Math.sqrt(nX * nX + nY * nY);
                nX /= nLen;
                nY /= nLen;
                lambda[0] = a;
                normal.Set(nX, nY);
                return true;
            }
        }
    }
    return false;
};
Box2D.Collision.b2Segment.prototype.Extend = function(aabb) {
    this.ExtendForward(aabb);
    this.ExtendBackward(aabb);
};
Box2D.Collision.b2Segment.prototype.ExtendForward = function(aabb) {
    var dX = this.p2.x - this.p1.x;
    var dY = this.p2.y - this.p1.y;
    var lambda = Math.min(dX > 0 ? (aabb.upperBound_.x - this.p1.x) / dX : dX < 0 ? (aabb.lowerBound_.x - this.p1.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound_.y - this.p1.y) / dY : dY < 0 ? (aabb.lowerBound_.y - this.p1.y) / dY : Number.POSITIVE_INFINITY);
    this.p2.x = this.p1.x + dX * lambda;
    this.p2.y = this.p1.y + dY * lambda;
};
Box2D.Collision.b2Segment.prototype.ExtendBackward = function(aabb) {
    var dX = (-this.p2.x) + this.p1.x;
    var dY = (-this.p2.y) + this.p1.y;
    var lambda = Math.min(dX > 0 ? (aabb.upperBound_.x - this.p2.x) / dX : dX < 0 ? (aabb.lowerBound_.x - this.p2.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound_.y - this.p2.y) / dY : dY < 0 ? (aabb.lowerBound_.y - this.p2.y) / dY : Number.POSITIVE_INFINITY);
    this.p1.x = this.p2.x + dX * lambda;
    this.p1.y = this.p2.y + dY * lambda;
};
/**
 * @constructor
 */
Box2D.Collision.b2SeparationFunction = function() {
    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
Box2D.Collision.b2SeparationFunction.prototype.Initialize = function(cache, proxyA, transformA, proxyB, transformB) {
    this.m_proxyA = proxyA;
    this.m_proxyB = proxyB;
    var count = cache.count;
;
    var localPointA;
    var localPointA1;
    var localPointA2;
    var localPointB;
    var localPointB1;
    var localPointB2;
    var pointAX = 0;
    var pointAY = 0;
    var pointBX = 0;
    var pointBY = 0;
    var normalX = 0;
    var normalY = 0;
    var tMat;
    var tVec;
    var s = 0;
    var sgn = 0;
    if (count == 1) {
        this.m_type = Box2D.Collision.b2SeparationFunction.e_points;
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointB;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_axis.x = pointBX - pointAX;
        this.m_axis.y = pointBY - pointAY;
        this.m_axis.Normalize();
    } else if (cache.indexB[0] == cache.indexB[1]) {
        this.m_type = Box2D.Collision.b2SeparationFunction.e_faceA;
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
        this.m_localPoint.x = 0.5 * (localPointA1.x + localPointA2.x);
        this.m_localPoint.y = 0.5 * (localPointA1.y + localPointA2.y);
        this.m_axis = Box2D.Common.Math.b2Math.CrossVF(Box2D.Common.Math.b2Math.SubtractVV(localPointA2, localPointA1), 1.0);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformA.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointB;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
        if (s < 0.0) {
            this.m_axis.NegativeSelf();
        }
    } else if (cache.indexA[0] == cache.indexA[0]) {
        this.m_type = Box2D.Collision.b2SeparationFunction.e_faceB;
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        this.m_localPoint.x = 0.5 * (localPointB1.x + localPointB2.x);
        this.m_localPoint.y = 0.5 * (localPointB1.y + localPointB2.y);
        this.m_axis = Box2D.Common.Math.b2Math.CrossVF(Box2D.Common.Math.b2Math.SubtractVV(localPointB2, localPointB1), 1.0);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformB.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
        if (s < 0.0) {
            this.m_axis.NegativeSelf();
        }
    } else {
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        var dA = Box2D.Common.Math.b2Math.MulMV(transformA.R, Box2D.Common.Math.b2Math.SubtractVV(localPointA2, localPointA1));
        var dB = Box2D.Common.Math.b2Math.MulMV(transformB.R, Box2D.Common.Math.b2Math.SubtractVV(localPointB2, localPointB1));
        var a = dA.x * dA.x + dA.y * dA.y;
        var e = dB.x * dB.x + dB.y * dB.y;
        var r = Box2D.Common.Math.b2Math.SubtractVV(dB, dA);
        var c = dA.x * r.x + dA.y * r.y;
        var f = dB.x * r.x + dB.y * r.y;
        var b = dA.x * dB.x + dA.y * dB.y;
        var denom = a * e - b * b;
        s = 0.0;
        if (denom != 0.0) {
            s = Box2D.Common.Math.b2Math.Clamp((b * f - c * e) / denom, 0.0, 1.0);
        }
        var t = (b * s + f) / e;
        if (t < 0.0) {
            t = 0.0;
            s = Box2D.Common.Math.b2Math.Clamp((b - c) / a, 0.0, 1.0);
        }
        localPointA = Box2D.Common.Math.b2Vec2.Get(0, 0);
        localPointA.x = localPointA1.x + s * (localPointA2.x - localPointA1.x);
        localPointA.y = localPointA1.y + s * (localPointA2.y - localPointA1.y);
        localPointB = Box2D.Common.Math.b2Vec2.Get(0, 0);
        localPointB.x = localPointB1.x + s * (localPointB2.x - localPointB1.x);
        localPointB.y = localPointB1.y + s * (localPointB2.y - localPointB1.y);
        if (s == 0.0 || s == 1.0) {
            this.m_type = Box2D.Collision.b2SeparationFunction.e_faceB;
            this.m_axis = Box2D.Common.Math.b2Math.CrossVF(Box2D.Common.Math.b2Math.SubtractVV(localPointB2, localPointB1), 1.0);
            this.m_axis.Normalize();
            this.m_localPoint = localPointB;
            tVec = this.m_axis;
            tMat = transformB.R;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tVec = this.m_localPoint;
            tMat = transformB.R;
            pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            tVec = localPointA;
            tMat = transformA.R;
            pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            sgn = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
            if (s < 0.0) {
                this.m_axis.NegativeSelf();
            }
        } else {
            this.m_type = Box2D.Collision.b2SeparationFunction.e_faceA;
            this.m_axis = Box2D.Common.Math.b2Math.CrossVF(Box2D.Common.Math.b2Math.SubtractVV(localPointA2, localPointA1), 1.0);
            this.m_localPoint = localPointA;
            tVec = this.m_axis;
            tMat = transformA.R;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tVec = this.m_localPoint;
            tMat = transformA.R;
            pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            tVec = localPointB;
            tMat = transformB.R;
            pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
            pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
            sgn = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
            if (s < 0.0) {
                this.m_axis.NegativeSelf();
            }
        }
    }
};
Box2D.Collision.b2SeparationFunction.prototype.Evaluate = function(transformA, transformB) {
    var axisA;
    var axisB;
    var localPointA;
    var localPointB;
    var pointA;
    var pointB;
    var seperation = 0;
    var normal;
    switch (this.m_type) {
    case Box2D.Collision.b2SeparationFunction.e_points:
        axisA = Box2D.Common.Math.b2Math.MulTMV(transformA.R, this.m_axis);
        axisB = Box2D.Common.Math.b2Math.MulTMV(transformB.R, this.m_axis.GetNegative());
        localPointA = this.m_proxyA.GetSupportVertex(axisA);
        localPointB = this.m_proxyB.GetSupportVertex(axisB);
        pointA = Box2D.Common.Math.b2Math.MulX(transformA, localPointA);
        pointB = Box2D.Common.Math.b2Math.MulX(transformB, localPointB);
        seperation = (pointB.x - pointA.x) * this.m_axis.x + (pointB.y - pointA.y) * this.m_axis.y;
        break;
    case Box2D.Collision.b2SeparationFunction.e_faceA:
        normal = Box2D.Common.Math.b2Math.MulMV(transformA.R, this.m_axis);
        pointA = Box2D.Common.Math.b2Math.MulX(transformA, this.m_localPoint);
        axisB = Box2D.Common.Math.b2Math.MulTMV(transformB.R, normal.GetNegative());
        localPointB = this.m_proxyB.GetSupportVertex(axisB);
        pointB = Box2D.Common.Math.b2Math.MulX(transformB, localPointB);
        seperation = (pointB.x - pointA.x) * normal.x + (pointB.y - pointA.y) * normal.y;
        break;
    case Box2D.Collision.b2SeparationFunction.e_faceB:
        normal = Box2D.Common.Math.b2Math.MulMV(transformB.R, this.m_axis);
        pointB = Box2D.Common.Math.b2Math.MulX(transformB, this.m_localPoint);
        axisA = Box2D.Common.Math.b2Math.MulTMV(transformA.R, normal.GetNegative());
        localPointA = this.m_proxyA.GetSupportVertex(axisA);
        pointA = Box2D.Common.Math.b2Math.MulX(transformA, localPointA);
        seperation = (pointA.x - pointB.x) * normal.x + (pointA.y - pointB.y) * normal.y;
        break;
    default:
;
        break;
    }
    return seperation;
};
Box2D.Collision.b2SeparationFunction.e_points = 0x01;
Box2D.Collision.b2SeparationFunction.e_faceA = 0x02;
Box2D.Collision.b2SeparationFunction.e_faceB = 0x04;
/**
 * @constructor
 */
Box2D.Collision.b2Simplex = function() {
    this.m_v1 = new Box2D.Collision.b2SimplexVertex();
    this.m_v2 = new Box2D.Collision.b2SimplexVertex();
    this.m_v3 = new Box2D.Collision.b2SimplexVertex();
    this.m_vertices = [this.m_v1, this.m_v2, this.m_v3];
};
Box2D.Collision.b2Simplex.prototype.ReadCache = function(cache, proxyA, transformA, proxyB, transformB) {
;
    var wALocal;
    var wBLocal;
    this.m_count = cache.count;
    var vertices = this.m_vertices;
    for (var i = 0; i < this.m_count; i++) {
        var v = vertices[i];
        v.indexA = cache.indexA[i];
        v.indexB = cache.indexB[i];
        wALocal = proxyA.GetVertex(v.indexA);
        wBLocal = proxyB.GetVertex(v.indexB);
        v.wA = Box2D.Common.Math.b2Math.MulX(transformA, wALocal);
        v.wB = Box2D.Common.Math.b2Math.MulX(transformB, wBLocal);
        v.w = Box2D.Common.Math.b2Math.SubtractVV(v.wB, v.wA);
        v.a = 0;
    }
    if (this.m_count > 1) {
        var metric1 = cache.metric;
        var metric2 = this.GetMetric();
        if (metric2 < .5 * metric1 || 2.0 * metric1 < metric2 || metric2 < Number.MIN_VALUE) {
            this.m_count = 0;
        }
    }
    if (this.m_count == 0) {
        v = vertices[0];
        v.indexA = 0;
        v.indexB = 0;
        wALocal = proxyA.GetVertex(0);
        wBLocal = proxyB.GetVertex(0);
        v.wA = Box2D.Common.Math.b2Math.MulX(transformA, wALocal);
        v.wB = Box2D.Common.Math.b2Math.MulX(transformB, wBLocal);
        v.w = Box2D.Common.Math.b2Math.SubtractVV(v.wB, v.wA);
        this.m_count = 1;
    }
};
Box2D.Collision.b2Simplex.prototype.WriteCache = function(cache) {
    cache.metric = this.GetMetric();
    cache.count = this.m_count;
    var vertices = this.m_vertices;
    for (var i = 0; i < this.m_count; i++) {
        cache.indexA[i] = vertices[i].indexA;
        cache.indexB[i] = vertices[i].indexB;
    }
};
Box2D.Collision.b2Simplex.prototype.GetSearchDirection = function() {
    if (this.m_count == 1) {
        return this.m_v1.w.GetNegative();
    } else if (this.m_count == 2) {
            var e12 = Box2D.Common.Math.b2Math.SubtractVV(this.m_v2.w, this.m_v1.w);
            var sgn = Box2D.Common.Math.b2Math.CrossVV(e12, this.m_v1.w.GetNegative());
            if (sgn > 0.0) {
                return Box2D.Common.Math.b2Math.CrossFV(1.0, e12);
            }
            else {
                return Box2D.Common.Math.b2Math.CrossVF(e12, 1.0);
            }
    } else {
;
        return Box2D.Common.Math.b2Vec2.Get(0, 0);
    }
};
Box2D.Collision.b2Simplex.prototype.GetClosestPoint = function() {
    if (this.m_count == 1) {
        return this.m_v1.w;
    } else if (this.m_count == 2) {
        return Box2D.Common.Math.b2Vec2.Get(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
    } else {
;
        return Box2D.Common.Math.b2Vec2.Get(0, 0);
    }
};
Box2D.Collision.b2Simplex.prototype.GetWitnessPoints = function(pA, pB) {
    if (this.m_count == 1) {
        pA.SetV(this.m_v1.wA);
        pB.SetV(this.m_v1.wB);
    } else if (this.m_count == 2) {
        pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
        pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
        pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
        pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
    } else if (this.m_count == 3) {
        pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
        pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
    } else {
;
    }
};
Box2D.Collision.b2Simplex.prototype.GetMetric = function() {
    if (this.m_count == 1) {
        return 0.0;
    } else if (this.m_count == 2) {
        return Box2D.Common.Math.b2Math.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
    } else if (this.m_count == 3) {
        return Box2D.Common.Math.b2Math.CrossVV(Box2D.Common.Math.b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), Box2D.Common.Math.b2Math.SubtractVV(this.m_v3.w, this.m_v1.w));
    } else {
;
        return 0.0;
    }
};
Box2D.Collision.b2Simplex.prototype.Solve2 = function() {
    var w1 = this.m_v1.w;
    var w2 = this.m_v2.w;
    var e12 = Box2D.Common.Math.b2Math.SubtractVV(w2, w1);
    var d12_2 = (-(w1.x * e12.x + w1.y * e12.y));
    if (d12_2 <= 0.0) {
        this.m_v1.a = 1.0;
        this.m_count = 1;
        return;
    }
    var d12_1 = (w2.x * e12.x + w2.y * e12.y);
    if (d12_1 <= 0.0) {
        this.m_v2.a = 1.0;
        this.m_count = 1;
        this.m_v1.Set(this.m_v2);
        return;
    }
    var inv_d12 = 1.0 / (d12_1 + d12_2);
    this.m_v1.a = d12_1 * inv_d12;
    this.m_v2.a = d12_2 * inv_d12;
    this.m_count = 2;
};
Box2D.Collision.b2Simplex.prototype.Solve3 = function() {
    var w1 = this.m_v1.w;
    var w2 = this.m_v2.w;
    var w3 = this.m_v3.w;
    var e12 = Box2D.Common.Math.b2Math.SubtractVV(w2, w1);
    var w1e12 = Box2D.Common.Math.b2Math.Dot(w1, e12);
    var w2e12 = Box2D.Common.Math.b2Math.Dot(w2, e12);
    var d12_1 = w2e12;
    var d12_2 = (-w1e12);
    var e13 = Box2D.Common.Math.b2Math.SubtractVV(w3, w1);
    var w1e13 = Box2D.Common.Math.b2Math.Dot(w1, e13);
    var w3e13 = Box2D.Common.Math.b2Math.Dot(w3, e13);
    var d13_1 = w3e13;
    var d13_2 = (-w1e13);
    var e23 = Box2D.Common.Math.b2Math.SubtractVV(w3, w2);
    var w2e23 = Box2D.Common.Math.b2Math.Dot(w2, e23);
    var w3e23 = Box2D.Common.Math.b2Math.Dot(w3, e23);
    var d23_1 = w3e23;
    var d23_2 = (-w2e23);
    var n123 = Box2D.Common.Math.b2Math.CrossVV(e12, e13);
    var d123_1 = n123 * Box2D.Common.Math.b2Math.CrossVV(w2, w3);
    var d123_2 = n123 * Box2D.Common.Math.b2Math.CrossVV(w3, w1);
    var d123_3 = n123 * Box2D.Common.Math.b2Math.CrossVV(w1, w2);
    if (d12_2 <= 0.0 && d13_2 <= 0.0) {
        this.m_v1.a = 1.0;
        this.m_count = 1;
        return;
    }
    if (d12_1 > 0.0 && d12_2 > 0.0 && d123_3 <= 0.0) {
        var inv_d12 = 1.0 / (d12_1 + d12_2);
        this.m_v1.a = d12_1 * inv_d12;
        this.m_v2.a = d12_2 * inv_d12;
        this.m_count = 2;
        return;
    }
    if (d13_1 > 0.0 && d13_2 > 0.0 && d123_2 <= 0.0) {
        var inv_d13 = 1.0 / (d13_1 + d13_2);
        this.m_v1.a = d13_1 * inv_d13;
        this.m_v3.a = d13_2 * inv_d13;
        this.m_count = 2;
        this.m_v2.Set(this.m_v3);
        return;
    }
    if (d12_1 <= 0.0 && d23_2 <= 0.0) {
        this.m_v2.a = 1.0;
        this.m_count = 1;
        this.m_v1.Set(this.m_v2);
        return;
    }
    if (d13_1 <= 0.0 && d23_1 <= 0.0) {
        this.m_v3.a = 1.0;
        this.m_count = 1;
        this.m_v1.Set(this.m_v3);
        return;
    }
    if (d23_1 > 0.0 && d23_2 > 0.0 && d123_1 <= 0.0) {
        var inv_d23 = 1.0 / (d23_1 + d23_2);
        this.m_v2.a = d23_1 * inv_d23;
        this.m_v3.a = d23_2 * inv_d23;
        this.m_count = 2;
        this.m_v1.Set(this.m_v3);
        return;
    }
    var inv_d123 = 1.0 / (d123_1 + d123_2 + d123_3);
    this.m_v1.a = d123_1 * inv_d123;
    this.m_v2.a = d123_2 * inv_d123;
    this.m_v3.a = d123_3 * inv_d123;
    this.m_count = 3;
};
/**
 * @constructor
 */
Box2D.Collision.b2SimplexCache = function() {
    this.indexA = [0, 0, 0];
    this.indexB = [0, 0, 0];
};
/**
 * @constructor
 */
Box2D.Collision.b2SimplexVertex = function() {};
Box2D.Collision.b2SimplexVertex.prototype.Set = function(other) {
    this.wA.SetV(other.wA);
    this.wB.SetV(other.wB);
    this.w.SetV(other.w);
    this.a = other.a;
    this.indexA = other.indexA;
    this.indexB = other.indexB;
};
/**
 * @constructor
 */
Box2D.Collision.b2TOIInput = function() {
    this.proxyA = new Box2D.Collision.b2DistanceProxy();
    this.proxyB = new Box2D.Collision.b2DistanceProxy();
    this.sweepA = new Box2D.Common.Math.b2Sweep();
    this.sweepB = new Box2D.Common.Math.b2Sweep();
};
Box2D.Collision.b2TimeOfImpact = {};
Box2D.Collision.b2TimeOfImpact.TimeOfImpact = function(input) {
    Box2D.Collision.b2TimeOfImpact.b2_toiCalls++;
    var proxyA = input.proxyA;
    var proxyB = input.proxyB;
    var sweepA = input.sweepA;
    var sweepB = input.sweepB;
;
;
    var radius = proxyA.m_radius + proxyB.m_radius;
    var tolerance = input.tolerance;
    var alpha = 0.0;
    var k_maxIterations = 1000;
    var iter = 0;
    var target = 0.0;
    Box2D.Collision.b2TimeOfImpact.s_cache.count = 0;
    Box2D.Collision.b2TimeOfImpact.s_distanceInput.useRadii = false;
    for (;;) {
        sweepA.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, alpha);
        sweepB.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, alpha);
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.proxyA = proxyA;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.proxyB = proxyB;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.transformA = Box2D.Collision.b2TimeOfImpact.s_xfA;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.transformB = Box2D.Collision.b2TimeOfImpact.s_xfB;
        Box2D.Collision.b2Distance.Distance(Box2D.Collision.b2TimeOfImpact.s_distanceOutput, Box2D.Collision.b2TimeOfImpact.s_cache, Box2D.Collision.b2TimeOfImpact.s_distanceInput);
        if (Box2D.Collision.b2TimeOfImpact.s_distanceOutput.distance <= 0.0) {
            alpha = 1.0;
            break;
        }
        Box2D.Collision.b2TimeOfImpact.s_fcn.Initialize(Box2D.Collision.b2TimeOfImpact.s_cache, proxyA, Box2D.Collision.b2TimeOfImpact.s_xfA, proxyB, Box2D.Collision.b2TimeOfImpact.s_xfB);
        var separation = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
        if (separation <= 0.0) {
            alpha = 1.0;
            break;
        }
        if (iter == 0) {
            if (separation > radius) {
                target = Math.max(radius - tolerance, 0.75 * radius);
            } else {
                target = Math.max(separation - tolerance, 0.02 * radius);
            }
        }
        if (separation - target < 0.5 * tolerance) {
            if (iter == 0) {
                alpha = 1.0;
                break;
            }
            break;
        }
        var newAlpha = alpha; {
            var x1 = alpha;
            var x2 = 1.0;
            var f1 = separation;
            sweepA.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, x2);
            sweepB.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, x2);
            var f2 = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
            if (f2 >= target) {
                alpha = 1.0;
                break;
            }
            var rootIterCount = 0;
            for (;;) {
                var x = 0;
                if (rootIterCount & 1) {
                    x = x1 + (target - f1) * (x2 - x1) / (f2 - f1);
                } else {
                    x = 0.5 * (x1 + x2);
                }
                sweepA.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, x);
                sweepB.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, x);
                var f = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
                if (Math.abs(f - target) < 0.025 * tolerance) {
                    newAlpha = x;
                    break;
                }
                if (f > target) {
                    x1 = x;
                    f1 = f;
                } else {
                    x2 = x;
                    f2 = f;
                }
                rootIterCount++;
                Box2D.Collision.b2TimeOfImpact.b2_toiRootIters++;
                if (rootIterCount == 50) {
                    break;
                }
            }
            Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = Math.max(Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters, rootIterCount);
        }
        if (newAlpha < (1.0 + 100.0 * Number.MIN_VALUE) * alpha) {
            break;
        }
        alpha = newAlpha;
        iter++;
        Box2D.Collision.b2TimeOfImpact.b2_toiIters++;
        if (iter == k_maxIterations) {
            break;
        }
    }
    Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = Math.max(Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters, iter);
    return alpha;
};
/**
 * @constructor
 */
Box2D.Collision.b2WorldManifold = function() {
    /** @type  {!Box2D.Common.Math.b2Vec2} */
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    /** @type {Array.<!Box2D.Common.Math.b2Vec2>} */
    this.m_points = [];
    /** @type {number} */
    this.m_pointCount = 0;
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; i++) {
        this.m_points[i] = Box2D.Common.Math.b2Vec2.Get(0, 0);
    }
};
/**
 * @param {!Box2D.Collision.b2Manifold} manifold
 * @param {!Box2D.Common.Math.b2Transform} xfA
 * @param {number} radiusA
 * @param {!Box2D.Common.Math.b2Transform} xfB
 * @param {number} radiusB
 */
Box2D.Collision.b2WorldManifold.prototype.Initialize = function(manifold, xfA, radiusA, xfB, radiusB) {
    if (manifold.m_pointCount == 0) {
        return;
    }
    var i = 0;
    var tVec;
    var tMat;
    var normalX = 0;
    var normalY = 0;
    var planePointX = 0;
    var planePointY = 0;
    var clipPointX = 0;
    var clipPointY = 0;
    switch (manifold.m_type) {
        case Box2D.Collision.b2Manifold.e_circles:
            tMat = xfA.R;
            tVec = manifold.m_localPoint;
            var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfB.R;
            tVec = manifold.m_points[0].m_localPoint;
            var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            var dX = pointBX - pointAX;
            var dY = pointBY - pointAY;
            var d2 = dX * dX + dY * dY;
            if (d2 > Box2D.Common.b2Settings.MIN_VALUE_SQUARED) {
                var d = Math.sqrt(d2);
                this.m_normal.x = dX / d;
                this.m_normal.y = dY / d;
            } else {
                this.m_normal.x = 1;
                this.m_normal.y = 0;
            }
            var cAX = pointAX + radiusA * this.m_normal.x;
            var cAY = pointAY + radiusA * this.m_normal.y;
            var cBX = pointBX - radiusB * this.m_normal.x;
            var cBY = pointBY - radiusB * this.m_normal.y;
            this.m_points[0].x = 0.5 * (cAX + cBX);
            this.m_points[0].y = 0.5 * (cAY + cBY);
            break;
        case Box2D.Collision.b2Manifold.e_faceA:
            tMat = xfA.R;
            tVec = manifold.m_localPlaneNormal;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfA.R;
            tVec = manifold.m_localPoint;
            planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            this.m_normal.x = normalX;
            this.m_normal.y = normalY;
            for (i = 0; i < manifold.m_pointCount; i++) {
                tMat = xfB.R;
                tVec = manifold.m_points[i].m_localPoint;
                clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
                this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY;
            }
            break;
        case Box2D.Collision.b2Manifold.e_faceB:
            tMat = xfB.R;
            tVec = manifold.m_localPlaneNormal;
            normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            tMat = xfB.R;
            tVec = manifold.m_localPoint;
            planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
            planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
            this.m_normal.x = (-normalX);
            this.m_normal.y = (-normalY);
            for (i = 0; i < manifold.m_pointCount; i++) {
                tMat = xfA.R;
                tVec = manifold.m_points[i].m_localPoint;
                clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
                this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY;
            }
            break;
    }
};
/**
 * @param {!Box2D.Dynamics.b2BodyDef} bd
 * @param {!Box2D.Dynamics.b2World} world
 * @constructor
 */
Box2D.Dynamics.b2Body = function(bd, world) {
    /**
     * @const
     * @private
     * @type {string}
     */
    this.ID = "Body" + Box2D.Dynamics.b2Body.NEXT_ID++;
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Transform}
     */
    this.m_xf = new Box2D.Common.Math.b2Transform();
    this.m_xf.position.SetV(bd.position);
    this.m_xf.R.Set(bd.angle);
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Sweep}
     */
    this.m_sweep = new Box2D.Common.Math.b2Sweep();
    this.m_sweep.localCenter.SetZero();
    this.m_sweep.t0 = 1.0;
    this.m_sweep.a0 = this.m_sweep.a = bd.angle;
    this.m_sweep.c.x = (this.m_xf.R.col1.x * this.m_sweep.localCenter.x + this.m_xf.R.col2.x * this.m_sweep.localCenter.y);
    this.m_sweep.c.y = (this.m_xf.R.col1.y * this.m_sweep.localCenter.x + this.m_xf.R.col2.y * this.m_sweep.localCenter.y);
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    /**
      * @private
      * @type {!Box2D.Common.Math.b2Vec2}
      */
    this.m_linearVelocity = bd.linearVelocity.Copy();
    /**
      * @private
      * @type {!Box2D.Common.Math.b2Vec2}
      */
    this.m_force = Box2D.Common.Math.b2Vec2.Get(0, 0);
    /**
     * @private
     * @type {boolean}
     */
    this.m_bullet = bd.bullet;
    /**
     * @private
     * @type {boolean}
     */
    this.m_fixedRotation = bd.fixedRotation;
    /**
     * @private
     * @type {boolean}
     */
    this.m_allowSleep = bd.allowSleep;
    /**
     * @private
     * @type {boolean}
     */
    this.m_awake = bd.awake;
    /**
     * @private
     * @type {boolean}
     */
    this.m_active = bd.active;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2World}
     */
    this.m_world = world;
    /**
     * @private
     * @type {Box2D.Dynamics.Joints.b2Joint}
     */
    this.m_jointList = null;
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactList}
     */
     this.contactList = new Box2D.Dynamics.Contacts.b2ContactList();
    /**
     * @private
     * @type {!Box2D.Dynamics.Controllers.b2ControllerList}
     */
    this.controllerList = new Box2D.Dynamics.Controllers.b2ControllerList();
    /**
     * @private
     * @type {number}
     */
    this.m_controllerCount = 0;
    /**
     * @private
     * @type {number}
     */
    this.m_angularVelocity = bd.angularVelocity;
    /**
     * @private
     * @type {number}
     */
    this.m_linearDamping = bd.linearDamping;
    /**
     * @private
     * @type {number}
     */
    this.m_angularDamping = bd.angularDamping;
    /**
     * @private
     * @type {number}
     */
    this.m_torque = 0;
    /**
     * @private
     * @type {number}
     */
    this.m_sleepTime = 0;
    /**
     * @private
     * @type {number}
     */
    this.m_type = bd.type;
    /**
     * @private
     * @type {number}
     */
    this.m_mass = this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? 1 : 0;
    /**
     * @private
     * @type {number}
     */
    this.m_invMass = this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? 1 : 0;
    /**
     * @private
     * @type {number}
     */
    this.m_I = 0;
    /**
     * @private
     * @type {number}
     */
    this.m_invI = 0;
    /**
     * @private
     * @type {number}
     */
    this.m_inertiaScale = bd.inertiaScale;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2FixtureList}
     */
    this.fixtureList = new Box2D.Dynamics.b2FixtureList();
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.b2BodyList>}
     */
     this.m_lists = [];
};
/**
 * @param {!Box2D.Dynamics.b2FixtureDef} def
 */
Box2D.Dynamics.b2Body.prototype.CreateFixture = function(def) {
;
    var fixture = new Box2D.Dynamics.b2Fixture(this, this.m_xf, def);
    if (this.m_active) {
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        fixture.CreateProxy(broadPhase, this.m_xf);
    }
    this.fixtureList.AddFixture(fixture);
    fixture.m_body = this;
    if (fixture.m_density > 0.0) {
        this.ResetMassData();
    }
    this.m_world.m_newFixture = true;
    return fixture;
};
Box2D.Dynamics.b2Body.prototype.CreateFixture2 = function(shape, density) {
    if (density === undefined) density = 0.0;
    var def = new Box2D.Dynamics.b2FixtureDef();
    def.shape = shape;
    def.density = density;
    return this.CreateFixture(def);
};
Box2D.Dynamics.b2Body.prototype.Destroy = function() {
    Box2D.Common.Math.b2Vec2.Free(this.m_linearVelocity);
    Box2D.Common.Math.b2Vec2.Free(this.m_force);
};
Box2D.Dynamics.b2Body.prototype.DestroyFixture = function(fixture) {
;
    this.fixtureList.RemoveFixture(fixture);
    for (var contactNode = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        if (fixture == contactNode.contact.m_fixtureA || fixture == contactNode.contact.m_fixtureB) {
            this.m_world.m_contactManager.Destroy(contactNode.contact);
        }
    }
    if (this.m_active) {
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        fixture.DestroyProxy(broadPhase);
    }
    fixture.Destroy();
    fixture.m_body = null;
    this.ResetMassData();
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} position
 * @param {number} angle
 */
Box2D.Dynamics.b2Body.prototype.SetPositionAndAngle = function(position, angle) {
;
    this.m_xf.R.Set(angle);
    this.m_xf.position.SetV(position);
    var tMat = this.m_xf.R;
    var tVec = this.m_sweep.localCenter;
    this.m_sweep.c.x = (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    this.m_sweep.c.y = (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    this.m_sweep.a0 = this.m_sweep.a = angle;
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        node.fixture.Synchronize(broadPhase, this.m_xf, this.m_xf);
    }
    this.m_world.m_contactManager.FindNewContacts();
};
/**
 * @param {!Box2D.Common.Math.b2Transform} xf
 */
Box2D.Dynamics.b2Body.prototype.SetTransform = function(xf) {
    this.SetPositionAndAngle(xf.position, xf.GetAngle());
};
/**
 * @return {!Box2D.Common.Math.b2Transform}
 */
Box2D.Dynamics.b2Body.prototype.GetTransform = function() {
    return this.m_xf;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2Body.prototype.GetPosition = function() {
    return this.m_xf.position;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} position
 */
Box2D.Dynamics.b2Body.prototype.SetPosition = function(position) {
    this.SetPositionAndAngle(position, this.GetAngle());
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetAngle = function() {
    return this.m_sweep.a;
};
/**
 * @param {number} angle
 */
Box2D.Dynamics.b2Body.prototype.SetAngle = function(angle) {
    this.SetPositionAndAngle(this.GetPosition(), angle);
};
Box2D.Dynamics.b2Body.prototype.GetWorldCenter = function() {
    return this.m_sweep.c;
};
Box2D.Dynamics.b2Body.prototype.GetLocalCenter = function() {
    return this.m_sweep.localCenter;
};
Box2D.Dynamics.b2Body.prototype.SetLinearVelocity = function(v) {
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        return;
    }
    this.m_linearVelocity.SetV(v);
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function() {
    return this.m_linearVelocity;
};
Box2D.Dynamics.b2Body.prototype.SetAngularVelocity = function(omega) {
    if (omega === undefined) omega = 0;
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        return;
    }
    this.m_angularVelocity = omega;
};
Box2D.Dynamics.b2Body.prototype.GetAngularVelocity = function() {
    return this.m_angularVelocity;
};
Box2D.Dynamics.b2Body.prototype.GetDefinition = function() {
    var bd = new Box2D.Dynamics.b2BodyDef();
    bd.type = this.GetType();
    bd.allowSleep = this.m_allowSleep;
    bd.angle = this.GetAngle();
    bd.angularDamping = this.m_angularDamping;
    bd.angularVelocity = this.m_angularVelocity;
    bd.fixedRotation = this.m_fixedRotation;
    bd.bullet = this.m_bullet;
    bd.active = this.m_active;
    bd.awake = this.m_awake;
    bd.linearDamping = this.m_linearDamping;
    bd.linearVelocity.SetV(this.GetLinearVelocity());
    bd.position = this.GetPosition();
    return bd;
};
Box2D.Dynamics.b2Body.prototype.ApplyForce = function(force, point) {
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return;
    }
    this.SetAwake(true);
    this.m_force.x += force.x;
    this.m_force.y += force.y;
    this.m_torque += ((point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x);
};
Box2D.Dynamics.b2Body.prototype.ApplyTorque = function(torque) {
    if (torque === undefined) torque = 0;
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return;
    }
    this.SetAwake(true);
    this.m_torque += torque;
};
Box2D.Dynamics.b2Body.prototype.ApplyImpulse = function(impulse, point) {
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return;
    }
    this.SetAwake(true);
    this.m_linearVelocity.x += this.m_invMass * impulse.x;
    this.m_linearVelocity.y += this.m_invMass * impulse.y;
    this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x);
};
Box2D.Dynamics.b2Body.prototype.Split = function(callback) {
    var linearVelocity = this.GetLinearVelocity().Copy();
    var angularVelocity = this.GetAngularVelocity();
    var center = this.GetWorldCenter();
    var body1 = this;
    var body2 = this.m_world.CreateBody(this.GetDefinition());
    var prev;
    for (var node = body1.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        var f = node.fixture;
        if (callback(f)) {
            body1.fixtureList.RemoveFixture(f);
            body2.fixtureList.AddFixture(f);
        }
    }
    body1.ResetMassData();
    body2.ResetMassData();
    var center1 = body1.GetWorldCenter();
    var center2 = body2.GetWorldCenter();
    var velocity1 = Box2D.Common.Math.b2Math.AddVV(linearVelocity, Box2D.Common.Math.b2Math.CrossFV(angularVelocity, Box2D.Common.Math.b2Math.SubtractVV(center1, center)));
    var velocity2 = Box2D.Common.Math.b2Math.AddVV(linearVelocity, Box2D.Common.Math.b2Math.CrossFV(angularVelocity, Box2D.Common.Math.b2Math.SubtractVV(center2, center)));
    body1.SetLinearVelocity(velocity1);
    body2.SetLinearVelocity(velocity2);
    body1.SetAngularVelocity(angularVelocity);
    body2.SetAngularVelocity(angularVelocity);
    body1.SynchronizeFixtures();
    body2.SynchronizeFixtures();
    return body2;
};
Box2D.Dynamics.b2Body.prototype.Merge = function(other) {
    for (var node = other.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        this.fixtureList.AddFixture(node.fixture);
        other.fixtureList.RemoveFixture(node.fixture);
    }
    other.ResetMassData();
    this.ResetMassData();
    this.SynchronizeFixtures();
};
Box2D.Dynamics.b2Body.prototype.GetMass = function() {
    return this.m_mass;
};
Box2D.Dynamics.b2Body.prototype.GetInertia = function() {
    return this.m_I;
};
/**
 * @param {Box2D.Collision.Shapes.b2MassData=} massData
 * @return {!Box2D.Collision.Shapes.b2MassData}
 */
Box2D.Dynamics.b2Body.prototype.GetMassData = function(massData) {
    if (!massData) {
        massData = new Box2D.Collision.Shapes.b2MassData();
    }
    massData.mass = this.m_mass;
    massData.I = this.m_I;
    massData.center.SetV(this.m_sweep.localCenter);
    return massData;
};
/**
 * @param {!Box2D.Collision.Shapes.b2MassData} massData
 */
Box2D.Dynamics.b2Body.prototype.SetMassData = function(massData) {
;
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return;
    }
    this.m_invMass = 0.0;
    this.m_I = 0.0;
    this.m_invI = 0.0;
    this.m_mass = massData.mass;
    if (this.m_mass <= 0.0) {
        this.m_mass = 1.0;
    }
    this.m_invMass = 1.0 / this.m_mass;
    if (massData.I > 0.0 && !this.m_fixedRotation) {
        this.m_I = massData.I - this.m_mass * (massData.center.x * massData.center.x + massData.center.y * massData.center.y);
        this.m_invI = 1.0 / this.m_I;
    }
    var oldCenter = this.m_sweep.c.Copy();
    this.m_sweep.localCenter.SetV(massData.center);
    this.m_sweep.c0.SetV(Box2D.Common.Math.b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_linearVelocity.x += this.m_angularVelocity * (-(this.m_sweep.c.y - oldCenter.y));
    this.m_linearVelocity.y += this.m_angularVelocity * (+(this.m_sweep.c.x - oldCenter.x));
};
Box2D.Dynamics.b2Body.prototype.ResetMassData = function() {
    this.m_mass = 0.0;
    this.m_invMass = 0.0;
    this.m_I = 0.0;
    this.m_invI = 0.0;
    this.m_sweep.localCenter.SetZero();
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody || this.m_type == Box2D.Dynamics.b2BodyDef.b2_kinematicBody) {
        return;
    }
    var center = Box2D.Common.Math.b2Vec2.Get(0, 0);
    for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        var f = node.fixture;
        if (f.m_density == 0.0) {
            continue;
        }
        var massData = f.GetMassData();
        this.m_mass += massData.mass;
        center.x += massData.center.x * massData.mass;
        center.y += massData.center.y * massData.mass;
        this.m_I += massData.I;
    }
    if (this.m_mass > 0.0) {
        this.m_invMass = 1.0 / this.m_mass;
        center.x *= this.m_invMass;
        center.y *= this.m_invMass;
    } else {
        this.m_mass = 1.0;
        this.m_invMass = 1.0;
    }
    if (this.m_I > 0.0 && !this.m_fixedRotation) {
        this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
        this.m_I *= this.m_inertiaScale;
;
        this.m_invI = 1.0 / this.m_I;
    } else {
        this.m_I = 0.0;
        this.m_invI = 0.0;
    }
    var oldCenter = this.m_sweep.c.Copy();
    this.m_sweep.localCenter.SetV(center);
    this.m_sweep.c0.SetV(Box2D.Common.Math.b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_linearVelocity.x += this.m_angularVelocity * (-(this.m_sweep.c.y - oldCenter.y));
    this.m_linearVelocity.y += this.m_angularVelocity * (+(this.m_sweep.c.x - oldCenter.x));
    Box2D.Common.Math.b2Vec2.Free(center);
    Box2D.Common.Math.b2Vec2.Free(oldCenter);
};
Box2D.Dynamics.b2Body.prototype.GetWorldPoint = function(localPoint) {
    var A = this.m_xf.R;
    var u = Box2D.Common.Math.b2Vec2.Get(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
    u.x += this.m_xf.position.x;
    u.y += this.m_xf.position.y;
    return u;
};
Box2D.Dynamics.b2Body.prototype.GetWorldVector = function(localVector) {
    return Box2D.Common.Math.b2Math.MulMV(this.m_xf.R, localVector);
};
Box2D.Dynamics.b2Body.prototype.GetLocalPoint = function(worldPoint) {
    return Box2D.Common.Math.b2Math.MulXT(this.m_xf, worldPoint);
};
Box2D.Dynamics.b2Body.prototype.GetLocalVector = function(worldVector) {
    return Box2D.Common.Math.b2Math.MulTMV(this.m_xf.R, worldVector);
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocityFromWorldPoint = function(worldPoint) {
    return Box2D.Common.Math.b2Vec2.Get(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x));
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocityFromLocalPoint = function(localPoint) {
    var A = this.m_xf.R;
    var worldPoint = Box2D.Common.Math.b2Vec2.Get(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
    worldPoint.x += this.m_xf.position.x;
    worldPoint.y += this.m_xf.position.y;
    var velocity = Box2D.Common.Math.b2Vec2.Get(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x));
    Box2D.Common.Math.b2Vec2.Free(worldPoint);
    return velocity;
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetLinearDamping = function() {
    return this.m_linearDamping;
};
/**
 * @param {number} linearDamping
 */
Box2D.Dynamics.b2Body.prototype.SetLinearDamping = function(linearDamping) {
    this.m_linearDamping = linearDamping;
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetAngularDamping = function() {
    return this.m_angularDamping;
};
/**
 * @param {number} angularDamping
 */
Box2D.Dynamics.b2Body.prototype.SetAngularDamping = function(angularDamping) {
    this.m_angularDamping = angularDamping;
};
/**
 * @param {number} type
 */
Box2D.Dynamics.b2Body.prototype.SetType = function(type) {
    if (this.m_type == type) {
        return;
    }
    this.m_type = type;
    this.ResetMassData();
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        this.m_linearVelocity.SetZero();
        this.m_angularVelocity = 0.0;
    }
    this.SetAwake(true);
    this.m_force.SetZero();
    this.m_torque = 0.0;
    for (var contactNode = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        contactNode.contact.FlagForFiltering();
    }
    for (var i = 0; i < this.m_lists.length; i++) {
        this.m_lists[i].UpdateBody(this);
    }
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2Body.prototype.GetType = function() {
    return this.m_type;
};
/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2Body.prototype.SetBullet = function(flag) {
    this.m_bullet = flag;
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsBullet = function() {
    return this.m_bullet;
};
/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2Body.prototype.SetSleepingAllowed = function(flag) {
    this.m_allowSleep = flag;
    if (!flag) {
        this.SetAwake(true);
    }
};
/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2Body.prototype.SetAwake = function(flag) {
    if (this.m_awake != flag) {
        this.m_awake = flag;
        this.m_sleepTime = 0;
        if (!flag) {
            this.m_linearVelocity.SetZero();
            this.m_angularVelocity = 0.0;
            this.m_force.SetZero();
            this.m_torque = 0.0;
        }
        for (var i = 0; i < this.m_lists.length; i++) {
            this.m_lists[i].UpdateBody(this);
        }
    }
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsAwake = function() {
    return this.m_awake;
};
/**
 * @param {boolean} fixed
 */
Box2D.Dynamics.b2Body.prototype.SetFixedRotation = function(fixed) {
    this.m_fixedRotation = fixed;
    this.ResetMassData();
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsFixedRotation = function() {
    return this.m_fixedRotation;
};
/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2Body.prototype.SetActive = function(flag) {
    if (flag == this.m_active) {
        return;
    }
    if (flag) {
        this.m_active = true;
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
            node.fixture.CreateProxy(broadPhase, this.m_xf);
        }
    } else {
        this.m_active = false;
        var broadPhase = this.m_world.m_contactManager.m_broadPhase;
        for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
            node.fixture.DestroyProxy(broadPhase);
        }
        for (var contactNode = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
            this.m_world.m_contactManager.Destroy(contactNode.contact);
        }
    }
    for (var i = 0; i < this.m_lists.length; i++) {
        this.m_lists[i].UpdateBody(this);
    }
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsActive = function() {
    return this.m_active;
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Body.prototype.IsSleepingAllowed = function() {
    return this.m_allowSleep;
};
Box2D.Dynamics.b2Body.prototype.GetFixtureList = function() {
    return this.fixtureList;
};
Box2D.Dynamics.b2Body.prototype.GetJointList = function() {
    return this.m_jointList;
};
Box2D.Dynamics.b2Body.prototype.GetControllerList = function() {
    return this.controllerList;
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 */
Box2D.Dynamics.b2Body.prototype.AddController = function(controller) {
    this.controllerList.AddController(controller);
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 */
Box2D.Dynamics.b2Body.prototype.RemoveController = function(controller) {
    this.controllerList.RemoveController(controller);
};
Box2D.Dynamics.b2Body.prototype.GetContactList = function() {
    return this.contactList;
};
Box2D.Dynamics.b2Body.prototype.GetWorld = function() {
    return this.m_world;
};
Box2D.Dynamics.b2Body.prototype.SynchronizeFixtures = function() {
    var xf1 = Box2D.Dynamics.b2Body.s_xf1;
    xf1.R.Set(this.m_sweep.a0);
    var tMat = xf1.R;
    var tVec = this.m_sweep.localCenter;
    xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var f;
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for (var node = this.fixtureList.GetFirstNode(); node; node = node.GetNextNode()) {
        node.fixture.Synchronize(broadPhase, xf1, this.m_xf);
    }
};
Box2D.Dynamics.b2Body.prototype.SynchronizeTransform = function() {
    this.m_xf.R.Set(this.m_sweep.a);
    var tMat = this.m_xf.R;
    var tVec = this.m_sweep.localCenter;
    this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
};
Box2D.Dynamics.b2Body.prototype.ShouldCollide = function(other) {
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody && other.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        return false;
    }
    for (var jn = this.m_jointList; jn; jn = jn.next) {
        if (jn.other == other) if (jn.joint.m_collideConnected == false) {
            return false;
        }
    }
    return true;
};
/**
 * @param {number} t
 */
Box2D.Dynamics.b2Body.prototype.Advance = function(t) {
    this.m_sweep.Advance(t);
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_sweep.a = this.m_sweep.a0;
    this.SynchronizeTransform();
};
/**
 * @type {number}
 * @private
 */
Box2D.Dynamics.b2Body.NEXT_ID = 0;
/**
 * @constructor
 */
Box2D.Dynamics.b2BodyDef = function() {
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    /** @type {!Box2D.Common.Math.b2Vec2} */
    this.linearVelocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    /** @type {number} */
    this.angle = 0.0;
    /** @type {number} */
    this.angularVelocity = 0.0;
    /** @type {number} */
    this.linearDamping = 0.0;
    /** @type {number} */
    this.angularDamping = 0.0;
    /** @type {boolean} */
    this.allowSleep = true;
    /** @type {boolean} */
    this.awake = true;
    /** @type {boolean} */
    this.fixedRotation = false;
    /** @type {boolean} */
    this.bullet = false;
    /** @type {number} */
    this.type = Box2D.Dynamics.b2BodyDef.b2_staticBody;
    /** @type {boolean} */
    this.active = true;
    /** @type {number} */
    this.inertiaScale = 1.0;
};
/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2BodyDef.b2_staticBody = 0;
/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2BodyDef.b2_kinematicBody = 1;
/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2BodyDef.b2_dynamicBody = 2;
/**
 * @constructor
 */
Box2D.Dynamics.b2BodyList = function() {
    /**
     * @private
     * @type {Array.<Box2D.Dynamics.b2BodyListNode>}
     */
    this.bodyFirstNodes = [];
    for(var i = 0; i <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; i++) {
        this.bodyFirstNodes[i] = null;
    }
    /**
     * @private
     * @type {Array.<Box2D.Dynamics.b2BodyListNode>}
     */
    this.bodyLastNodes = [];
    for(var i = 0; i <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; i++) {
        this.bodyLastNodes[i] = null;
    }
    /**
     * @private
     * @type {Object.<Array.<Box2D.Dynamics.b2BodyListNode>>}
     */
    this.bodyNodeLookup = {};
    /**
     * @private
     * @type {number}
     */
    this.bodyCount = 0;
};
/**
 * @param {number} type
 * @return {Box2D.Dynamics.b2BodyListNode}
 */
Box2D.Dynamics.b2BodyList.prototype.GetFirstNode = function(type) {
    return this.bodyFirstNodes[type];
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.b2BodyList.prototype.AddBody = function(body) {
    var bodyID = body.ID;
    if (this.bodyNodeLookup[bodyID] == null) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.allBodies);
        this.UpdateBody(body);
        body.m_lists.push(this);
        this.bodyCount++;
    }
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.b2BodyList.prototype.UpdateBody = function(body) {
    var type = body.GetType();
    var bodyID = body.ID;
    var awake = body.IsAwake();
    var active = body.IsActive();
    if (type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies);
    }
    if (type != Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.nonStaticBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.nonStaticBodies);
    }
    if (type != Box2D.Dynamics.b2BodyDef.b2_staticBody && active && awake) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies);
    }
    if (awake) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.awakeBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.awakeBodies);
    }
    if (active) {
        this.CreateNode(body, bodyID, Box2D.Dynamics.b2BodyList.TYPES.activeBodies);
    } else {
        this.RemoveNode(bodyID, Box2D.Dynamics.b2BodyList.TYPES.activeBodies);
    }
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.b2BodyList.prototype.RemoveBody = function(body) {
    var bodyID = body.ID;
    if (this.bodyNodeLookup[bodyID] != null) {
        cr.arrayFindRemove(body.m_lists, this);
        for(var i = 0; i <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; i++) {
            this.RemoveNode(bodyID, i);
        }
        delete this.bodyNodeLookup[bodyID];
        this.bodyCount--;
    }
};
/**
 * @param {string} bodyID
 * @param {number} type
 */
Box2D.Dynamics.b2BodyList.prototype.RemoveNode = function(bodyID, type) {
    var nodeList = this.bodyNodeLookup[bodyID];
    if (nodeList == null) {
        return;
    }
    var node = nodeList[type];
    if (node == null) {
        return;
    }
    nodeList[type] = null;
    var prevNode = node.GetPreviousNode();
    var nextNode = node.GetNextNode();
    if (prevNode == null) {
        this.bodyFirstNodes[type] = nextNode;
    } else {
        prevNode.SetNextNode(nextNode);
    }
    if (nextNode == null) {
        this.bodyLastNodes[type] = prevNode;
    } else {
        nextNode.SetPreviousNode(prevNode);
    }
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 * @param {string} bodyID
 * @param {number} type
 */
Box2D.Dynamics.b2BodyList.prototype.CreateNode = function(body, bodyID, type) {
    var nodeList = this.bodyNodeLookup[bodyID];
    if (nodeList == null) {
        nodeList = [];
        for(var i = 0; i <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; i++) {
            nodeList[i] = null;
        }
        this.bodyNodeLookup[bodyID] = nodeList;
    }
    if (nodeList[type] == null) {
        nodeList[type] = new Box2D.Dynamics.b2BodyListNode(body);
        var prevNode = this.bodyLastNodes[type];
        if (prevNode != null) {
            prevNode.SetNextNode(nodeList[type]);
        } else {
            this.bodyFirstNodes[type] = nodeList[type];
        }
        nodeList[type].SetPreviousNode(prevNode);
        this.bodyLastNodes[type] = nodeList[type];
    }
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2BodyList.prototype.GetBodyCount = function() {
    return this.bodyCount;
};
/**
 * @enum {number}
 */
Box2D.Dynamics.b2BodyList.TYPES = {
    dynamicBodies: 0,
    nonStaticBodies: 1,
    activeBodies: 2,
    nonStaticActiveAwakeBodies: 3,
    awakeBodies: 4,
    allBodies: 5 // Assumed to be last by above code
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 * @constructor
 */
Box2D.Dynamics.b2BodyListNode = function(body) {
    /**
     * @const
     * @type {!Box2D.Dynamics.b2Body}
     */
    this.body = body;
    /**
     * @private
     * @type {Box2D.Dynamics.b2BodyListNode}
     */
    this.next = null;
    /**
     * @private
     * @type {Box2D.Dynamics.b2BodyListNode}
     */
    this.previous = null;
};
/**
 * @param {Box2D.Dynamics.b2BodyListNode} node
 */
Box2D.Dynamics.b2BodyListNode.prototype.SetNextNode = function(node) {
    this.next = node;
};
/**
 * @param {Box2D.Dynamics.b2BodyListNode} node
 */
Box2D.Dynamics.b2BodyListNode.prototype.SetPreviousNode = function(node) {
    this.previous = node;
};
/**
 * @return {Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.b2BodyListNode.prototype.GetBody = function() {
    return this.body;
};
/**
 * @return {Box2D.Dynamics.b2BodyListNode}
 */
Box2D.Dynamics.b2BodyListNode.prototype.GetNextNode = function() {
    return this.next;
};
/**
 * @return {Box2D.Dynamics.b2BodyListNode}
 */
Box2D.Dynamics.b2BodyListNode.prototype.GetPreviousNode = function() {
    return this.previous;
};
/**
 * @constructor
 */
Box2D.Dynamics.b2ContactFilter = function() {};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @return {boolean}
 */
Box2D.Dynamics.b2ContactFilter.prototype.ShouldCollide = function(fixtureA, fixtureB) {
    var filter1 = fixtureA.GetFilterData();
    var filter2 = fixtureB.GetFilterData();
    if (filter1.groupIndex == filter2.groupIndex && filter1.groupIndex != 0) {
        return filter1.groupIndex > 0;
    }
    return (filter1.maskBits & filter2.categoryBits) != 0 && (filter1.categoryBits & filter2.maskBits) != 0;
};
/** @type {!Box2D.Dynamics.b2ContactFilter} */
Box2D.Dynamics.b2ContactFilter.b2_defaultFilter = new Box2D.Dynamics.b2ContactFilter();
/**
 * @constructor
 */
Box2D.Dynamics.b2ContactImpulse = function () {
    this.normalImpulses = [];
    this.tangentImpulses = [];
};
/**
 * @constructor
 */
Box2D.Dynamics.b2ContactListener = function () {};
Box2D.Dynamics.b2ContactListener.prototype.BeginContact = function (contact) {};
Box2D.Dynamics.b2ContactListener.prototype.EndContact = function (contact) {};
Box2D.Dynamics.b2ContactListener.prototype.PreSolve = function (contact, oldManifold) {};
Box2D.Dynamics.b2ContactListener.prototype.PostSolve = function (contact, impulse) {};
/**
 * @param {!Box2D.Dynamics.b2World} world
 * @constructor
 */
Box2D.Dynamics.b2ContactManager = function(world) {
    /**
     * @private
     * @const
     * @type {!Box2D.Dynamics.b2World}
     */
    this.m_world = world;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2ContactFilter}
     */
    this.m_contactFilter = Box2D.Dynamics.b2ContactFilter.b2_defaultFilter;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2ContactListener}
     */
    this.m_contactListener = Box2D.Dynamics.b2ContactListener.b2_defaultListener;
    /**
     * @private
     * @const
     * @type {!Box2D.Dynamics.Contacts.b2ContactFactory}
     */
    this.m_contactFactory = new Box2D.Dynamics.Contacts.b2ContactFactory();
    /**
     * @private
     * @type {!Box2D.Collision.b2DynamicTreeBroadPhase}
     */
    this.m_broadPhase = new Box2D.Collision.b2DynamicTreeBroadPhase();
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.b2ContactManager.prototype.AddPair = function (fixtureA, fixtureB) {
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if (bodyA == bodyB) {
      return;
  }
  if (!bodyB.ShouldCollide(bodyA)) {
     return;
  }
  if (!this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
     return;
  }
  for (var contactNode = bodyB.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
    var fA = contactNode.contact.m_fixtureA;
    if (fA == fixtureA) {
        var fB = contactNode.contact.m_fixtureB;
        if (fB == fixtureB) {
            return;
        }
    } else if (fA == fixtureB) {
        var fB = contactNode.contact.m_fixtureB;
        if (fB == fixtureA) {
            return;
        }
    }
  }
  var c = this.m_contactFactory.Create(fixtureA, fixtureB);
};
Box2D.Dynamics.b2ContactManager.prototype.FindNewContacts = function () {
    var self = this;
    /** @type {function(!Box2D.Dynamics.b2Fixture, !Box2D.Dynamics.b2Fixture)} */
    var addPairCallback = function(fixtureA, fixtureB) {
        self.AddPair(fixtureA, fixtureB)
    };
    this.m_broadPhase.UpdatePairs(addPairCallback);
};
Box2D.Dynamics.b2ContactManager.prototype.Destroy = function (c) {
    var fixtureA = c.m_fixtureA;
    var fixtureB = c.m_fixtureB;
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if (c.touching) {
        this.m_contactListener.EndContact(c);
    }
    if (c.m_manifold.m_pointCount > 0) {
        c.m_fixtureA.GetBody().SetAwake(true);
        c.m_fixtureB.GetBody().SetAwake(true);
    }
    c.RemoveFromLists();
    this.m_contactFactory.Destroy(c);
};
Box2D.Dynamics.b2ContactManager.prototype.Collide = function() {
    for (var contactNode = this.m_world.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        var c = contactNode.contact;
        var fixtureA = c.m_fixtureA;
        var fixtureB = c.m_fixtureB;
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        if (bodyA.IsAwake() == false && bodyB.IsAwake() == false) {
            continue;
        }
        if (c.IsFiltering()) {
            if (bodyB.ShouldCollide(bodyA) == false) {
                this.Destroy(c);
                continue;
            }
            if (this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
                this.Destroy(c);
                continue;
            }
            c.ClearFiltering();
        }
        var proxyA = fixtureA.m_proxy;
        var proxyB = fixtureB.m_proxy;
        var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);
        if (overlap == false) {
            this.Destroy(c);
            continue;
        }
        c.Update(this.m_contactListener);
    }
};
/**
 * @constructor
 */
Box2D.Dynamics.b2DestructionListener = function () {};
Box2D.Dynamics.b2DestructionListener.prototype.SayGoodbyeJoint = function (joint) {};
Box2D.Dynamics.b2DestructionListener.prototype.SayGoodbyeFixture = function (fixture) {};
/**
 * @constructor
 */
Box2D.Dynamics.b2FilterData = function () {
  this.categoryBits = 0x0001;
  this.maskBits = 0xFFFF;
  this.groupIndex = 0;
};
/**
 * @return {!Box2D.Dynamics.b2FilterData}
 */
Box2D.Dynamics.b2FilterData.prototype.Copy = function () {
  var copy = new Box2D.Dynamics.b2FilterData();
  copy.categoryBits = this.categoryBits;
  copy.maskBits = this.maskBits;
  copy.groupIndex = this.groupIndex;
  return copy;
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 * @param {!Box2D.Common.Math.b2Transform} xf
 * @param {!Box2D.Dynamics.b2FixtureDef} def
 * @constructor
 */
Box2D.Dynamics.b2Fixture = function(body, xf, def) {
    /**
     * @const
     * @private
     * @type {string}
     */
    this.ID = "Fixture" + Box2D.Dynamics.b2Fixture.NEXT_ID++;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2FilterData}
     */
    this.m_filter = def.filter.Copy();
    /**
     * @private
     * @type {!Box2D.Collision.b2AABB}
     */
    this.m_aabb = Box2D.Collision.b2AABB.Get();
    /**
     * @private
     * @type {!Box2D.Dynamics.b2Body}
     */
    this.m_body = body;
    /**
     * @private
     * @type {!Box2D.Collision.Shapes.b2Shape}
     */
    this.m_shape = def.shape.Copy();
    /**
     * @private
     * @type {number}
     */
    this.m_density = def.density;
    /**
     * @private
     * @type {number}
     */
    this.m_friction = def.friction;
    /**
     * @private
     * @type {number}
     */
    this.m_restitution = def.restitution;
    /**
     * @private
     * @type {boolean}
     */
    this.m_isSensor = def.isSensor;
};
/**
 * @return {!Box2D.Collision.Shapes.b2Shape}
 */
Box2D.Dynamics.b2Fixture.prototype.GetShape = function() {
    return this.m_shape;
};
/**
 * @param {boolean} sensor
 */
Box2D.Dynamics.b2Fixture.prototype.SetSensor = function(sensor) {
    if (this.m_isSensor == sensor) {
        return;
    }
    this.m_isSensor = sensor;
    if (this.m_body == null) {
        return;
    }
    for (var contactNode = this.m_body.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        var fixtureA = contactNode.contact.m_fixtureA;
        var fixtureB = contactNode.contact.m_fixtureB;
        if (fixtureA == this || fixtureB == this) {
            contactNode.contact.SetSensor(fixtureA.sensor || fixtureB.sensor);
        }
    }
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.b2Fixture.prototype.IsSensor = function() {
    return this.m_isSensor;
};
/**
 * @param {!Box2D.Dynamics.b2FilterData} filter
 */
Box2D.Dynamics.b2Fixture.prototype.SetFilterData = function(filter) {
    this.m_filter = filter.Copy();
    if (this.m_body == null) {
        return;
    }
    for (var contactNode = this.m_body.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        if (contactNode.contact.m_fixtureA == this || contactNode.contact.m_fixtureB == this) {
            contactNode.contact.FlagForFiltering();
        }
    }
};
/**
 * @return {!Box2D.Dynamics.b2FilterData}
 */
Box2D.Dynamics.b2Fixture.prototype.GetFilterData = function() {
    return this.m_filter.Copy();
};
/**
 * @return {Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.b2Fixture.prototype.GetBody = function() {
    return this.m_body;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} p
 * @return {boolean}
 */
Box2D.Dynamics.b2Fixture.prototype.TestPoint = function(p) {
    return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
};
/**
 * @param {!Box2D.Collision.b2RayCastOutput} output
 * @param {!Box2D.Collision.b2RayCastInput} input
 * @return {boolean}
 */
Box2D.Dynamics.b2Fixture.prototype.RayCast = function(output, input) {
    return this.m_shape.RayCast(output, input, this.m_body.GetTransform());
};
/**
 * @param {Box2D.Collision.Shapes.b2MassData=} massData
 * @return {!Box2D.Collision.Shapes.b2MassData}
 */
Box2D.Dynamics.b2Fixture.prototype.GetMassData = function(massData) {
    if (!massData) {
        massData = new Box2D.Collision.Shapes.b2MassData();
    }
    this.m_shape.ComputeMass(massData, this.m_density);
    return massData;
};
/**
 * @param {number} density
 */
Box2D.Dynamics.b2Fixture.prototype.SetDensity = function(density) {
    this.m_density = density;
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2Fixture.prototype.GetDensity = function() {
    return this.m_density;
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2Fixture.prototype.GetFriction = function() {
    return this.m_friction;
};
/**
 * @param {number} friction
 */
Box2D.Dynamics.b2Fixture.prototype.SetFriction = function(friction) {
    this.m_friction = friction;
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2Fixture.prototype.GetRestitution = function() {
    return this.m_restitution;
};
/**
 * @param {number} restitution
 */
Box2D.Dynamics.b2Fixture.prototype.SetRestitution = function(restitution) {
    this.m_restitution = restitution;
};
/**
 * @return {!Box2D.Collision.b2AABB}
 */
Box2D.Dynamics.b2Fixture.prototype.GetAABB = function() {
    return this.m_aabb;
};
Box2D.Dynamics.b2Fixture.prototype.Destroy = function() {
    Box2D.Collision.b2AABB.Free(this.m_aabb);
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeBroadPhase} broadPhase
 * @param {!Box2D.Common.Math.b2Transform} xf
 */
Box2D.Dynamics.b2Fixture.prototype.CreateProxy = function(broadPhase, xf) {
    this.m_shape.ComputeAABB(this.m_aabb, xf);
    this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this);
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeBroadPhase} broadPhase
 */
Box2D.Dynamics.b2Fixture.prototype.DestroyProxy = function(broadPhase) {
    if (this.m_proxy == null) {
        return;
    }
    broadPhase.DestroyProxy(this.m_proxy);
    this.m_proxy = null;
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeBroadPhase} broadPhase
 * @param {!Box2D.Common.Math.b2Transform} transform1
 * @param {!Box2D.Common.Math.b2Transform} transform2
 */
Box2D.Dynamics.b2Fixture.prototype.Synchronize = function(broadPhase, transform1, transform2) {
    if (!this.m_proxy) return;
    var aabb1 = Box2D.Collision.b2AABB.Get();
    var aabb2 = Box2D.Collision.b2AABB.Get();
    this.m_shape.ComputeAABB(aabb1, transform1);
    this.m_shape.ComputeAABB(aabb2, transform2);
    this.m_aabb.Combine(aabb1, aabb2);
    Box2D.Collision.b2AABB.Free(aabb1);
    Box2D.Collision.b2AABB.Free(aabb2);
    var displacement = Box2D.Common.Math.b2Math.SubtractVV(transform2.position, transform1.position);
    broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement);
    Box2D.Common.Math.b2Vec2.Free(displacement);
};
/**
 * @type {number}
 * @private
 */
Box2D.Dynamics.b2Fixture.NEXT_ID = 0;
/**
 * @constructor
 */
Box2D.Dynamics.b2FixtureDef = function () {
    /**
     * @type {!Box2D.Dynamics.b2FilterData}
     */
    this.filter = new Box2D.Dynamics.b2FilterData();
    this.filter.categoryBits = 0x0001;
    this.filter.maskBits = 0xFFFF;
    this.filter.groupIndex = 0;
    /**
     * @type {Box2D.Collision.Shapes.b2Shape}
     */
    this.shape = null;
    /**
     * @type {number}
     */
    this.friction = 0.2;
    /**
     * @type {number}
     */
    this.restitution = 0.0;
    /**
     * @type {number}
     */
    this.density = 0.0;
    /**
     * @type {boolean}
     */
    this.isSensor = false;
};
/**
 * @constructor
 */
Box2D.Dynamics.b2FixtureList = function() {
    /**
     * @private
     * @type {Box2D.Dynamics.b2FixtureListNode}
     */
    this.fixtureFirstNode = null;
    /**
     * @private
     * @type {Box2D.Dynamics.b2FixtureListNode}
     */
    this.fixtureLastNode = null;
    /**
     * @private
     * @type {Object.<Box2D.Dynamics.b2FixtureListNode>}
     */
    this.fixtureNodeLookup = {};
    /**
     * @private
     * @type {number}
     */
    this.fixtureCount = 0;
};
/**
 * @return {Box2D.Dynamics.b2FixtureListNode}
 */
Box2D.Dynamics.b2FixtureList.prototype.GetFirstNode = function() {
    return this.fixtureFirstNode;
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixture
 */
Box2D.Dynamics.b2FixtureList.prototype.AddFixture = function(fixture) {
    var fixtureID = fixture.ID;
    if (this.fixtureNodeLookup[fixtureID] == null) {
        var node = new Box2D.Dynamics.b2FixtureListNode(fixture);
        var prevNode = this.fixtureLastNode;
        if (prevNode != null) {
            prevNode.SetNextNode(node);
        } else {
            this.fixtureFirstNode = node;
        }
        node.SetPreviousNode(prevNode);
        this.fixtureLastNode = node;
        this.fixtureNodeLookup[fixtureID] = node;
        this.fixtureCount++;
    }
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixture
 */
Box2D.Dynamics.b2FixtureList.prototype.RemoveFixture = function(fixture) {
    var fixtureID = fixture.ID;
    var node = this.fixtureNodeLookup[fixtureID];
    if (node == null) {
        return;
    }
    var prevNode = node.GetPreviousNode();
    var nextNode = node.GetNextNode();
    if (prevNode == null) {
        this.fixtureFirstNode = nextNode;
    } else {
        prevNode.SetNextNode(nextNode);
    }
    if (nextNode == null) {
        this.fixtureLastNode = prevNode;
    } else {
        nextNode.SetPreviousNode(prevNode);
    }
    delete this.fixtureNodeLookup[fixtureID];
    this.fixtureCount--;
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2FixtureList.prototype.GetFixtureCount = function() {
    return this.fixtureCount;
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixture
 * @constructor
 */
Box2D.Dynamics.b2FixtureListNode = function(fixture) {
    /**
     * @const
     * @type {!Box2D.Dynamics.b2Fixture}
     */
    this.fixture = fixture;
    /**
     * @private
     * @type {Box2D.Dynamics.b2FixtureListNode}
     */
    this.next = null;
    /**
     * @private
     * @type {Box2D.Dynamics.b2FixtureListNode}
     */
    this.previous = null;
};
/**
 * @param {Box2D.Dynamics.b2FixtureListNode} node
 */
Box2D.Dynamics.b2FixtureListNode.prototype.SetNextNode = function(node) {
    this.next = node;
};
/**
 * @param {Box2D.Dynamics.b2FixtureListNode} node
 */
Box2D.Dynamics.b2FixtureListNode.prototype.SetPreviousNode = function(node) {
    this.previous = node;
};
/**
 * @return {Box2D.Dynamics.b2FixtureListNode}
 */
Box2D.Dynamics.b2FixtureListNode.prototype.GetNextNode = function() {
    return this.next;
};
/**
 * @return {Box2D.Dynamics.b2FixtureListNode}
 */
Box2D.Dynamics.b2FixtureListNode.prototype.GetPreviousNode = function() {
    return this.previous;
};
/**
 * @param {!Box2D.Dynamics.b2ContactListener} listener
 * @param {!Box2D.Dynamics.Contacts.b2ContactSolver} contactSolver
 * @constructor
 */
Box2D.Dynamics.b2Island = function(listener, contactSolver) {
    /**
     * @private
     * @type {!Box2D.Dynamics.b2ContactListener}
     */
    this.m_listener = listener;
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactSolver}
     */
    this.m_contactSolver = contactSolver;
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.b2Body>}
     */
    this.m_bodies = [];
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.b2Body>}
     */
    this.m_dynamicBodies = [];
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.b2Body>}
     */
    this.m_nonStaticBodies = [];
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.Contacts.b2Contact>}
     */
    this.m_contacts = [];
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.Joints.b2Joint>}
     */
    this.m_joints = [];
};
Box2D.Dynamics.b2Island.prototype.Clear = function() {
    this.m_bodies = [];
    this.m_dynamicBodies = [];
    this.m_nonStaticBodies = [];
    this.m_contacts = [];
    this.m_joints = [];
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @param {!Box2D.Common.Math.b2Vec2} gravity
 * @param {boolean} allowSleep
 */
Box2D.Dynamics.b2Island.prototype.Solve = function(step, gravity, allowSleep) {
    this._InitializeVelocities(step, gravity);
    this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contacts.length);
    this._SolveVelocityConstraints(step);
    this._SolveBodies(step);
    this._SolvePositionConstraints(step);
    this.Report(this.m_contactSolver.m_constraints);
    if (allowSleep) {
        this._SleepIfTired(step);
    }
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @param {!Box2D.Common.Math.b2Vec2} gravity
 * @private
 */
Box2D.Dynamics.b2Island.prototype._InitializeVelocities = function(step, gravity) {
    for (var i = 0; i < this.m_dynamicBodies.length; i++) {
        var b = this.m_dynamicBodies[i];
        b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
        b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
        b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
        b.m_linearVelocity.Multiply(Box2D.Common.Math.b2Math.Clamp(1.0 - step.dt * b.m_linearDamping, 0.0, 1.0));
        b.m_angularVelocity *= Box2D.Common.Math.b2Math.Clamp(1.0 - step.dt * b.m_angularDamping, 0.0, 1.0);
    }
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @private
 */
Box2D.Dynamics.b2Island.prototype._SolveVelocityConstraints = function(step) {
    this.m_contactSolver.InitVelocityConstraints(step);
    for (var jointInitIdx = 0; jointInitIdx < this.m_joints.length; jointInitIdx++) {
        this.m_joints[jointInitIdx].InitVelocityConstraints(step);
    }
    for (var velocityIterationCnt = 0; velocityIterationCnt < step.velocityIterations; velocityIterationCnt++) {
        for (var jointSolveIdx = 0; jointSolveIdx < this.m_joints.length; jointSolveIdx++) {
            this.m_joints[jointSolveIdx].SolveVelocityConstraints(step);
        }
        this.m_contactSolver.SolveVelocityConstraints();
    }
    for (var jointFinalizeIdx = 0; jointFinalizeIdx < this.m_joints.length; jointFinalizeIdx++) {
        this.m_joints[jointFinalizeIdx].FinalizeVelocityConstraints();
    }
    this.m_contactSolver.FinalizeVelocityConstraints();
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @private
 */
Box2D.Dynamics.b2Island.prototype._SolveBodies = function(step) {
    for (var i = 0; i < this.m_nonStaticBodies.length; ++i) {
        var b = this.m_nonStaticBodies[i];
        var translationX = step.dt * b.m_linearVelocity.x;
        var translationY = step.dt * b.m_linearVelocity.y;
        if ((translationX * translationX + translationY * translationY) > Box2D.Common.b2Settings.b2_maxTranslationSquared) {
            b.m_linearVelocity.Normalize();
            b.m_linearVelocity.x *= Box2D.Common.b2Settings.b2_maxTranslation * step.inv_dt;
            b.m_linearVelocity.y *= Box2D.Common.b2Settings.b2_maxTranslation * step.inv_dt;
        }
        var rotation = step.dt * b.m_angularVelocity;
        if (rotation * rotation > Box2D.Common.b2Settings.b2_maxRotationSquared) {
            if (b.m_angularVelocity < 0.0) {
                b.m_angularVelocity = -Box2D.Common.b2Settings.b2_maxRotation * step.inv_dt;
            } else {
                b.m_angularVelocity = Box2D.Common.b2Settings.b2_maxRotation * step.inv_dt;
            }
        }
        b.m_sweep.c0.SetV(b.m_sweep.c);
        b.m_sweep.a0 = b.m_sweep.a;
        b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
        b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
        b.m_sweep.a += step.dt * b.m_angularVelocity;
        b.SynchronizeTransform();
    }
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @private
 */
Box2D.Dynamics.b2Island.prototype._SolvePositionConstraints = function(step) {
    for (var i = 0; i < step.positionIterations; i++) {
        var contactsOkay = this.m_contactSolver.SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte);
        var jointsOkay = true;
        for (var j = 0; j < this.m_joints.length; j++) {
            var jointOkay = this.m_joints[j].SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte);
            jointsOkay = jointsOkay && jointOkay;
        }
        if (contactsOkay && jointsOkay) {
            break;
        }
    }
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @private
 */
Box2D.Dynamics.b2Island.prototype._SleepIfTired = function(step) {
    var minSleepTime = Number.MAX_VALUE;
    for (var nonstaticBodyIdx = 0; nonstaticBodyIdx < this.m_nonStaticBodies.length; nonstaticBodyIdx++) {
        var b = this.m_nonStaticBodies[nonstaticBodyIdx];
        if (!b.m_allowSleep || Math.abs(b.m_angularVelocity) > Box2D.Common.b2Settings.b2_angularSleepTolerance || Box2D.Common.Math.b2Math.Dot(b.m_linearVelocity, b.m_linearVelocity) > Box2D.Common.b2Settings.b2_linearSleepToleranceSquared) {
            b.m_sleepTime = 0.0;
            minSleepTime = 0.0;
        } else {
            b.m_sleepTime += step.dt;
            minSleepTime = Math.min(minSleepTime, b.m_sleepTime);
        }
    }
    if (minSleepTime >= Box2D.Common.b2Settings.b2_timeToSleep) {
        for (var bodyIdx = 0; bodyIdx < this.m_bodies.length; bodyIdx++) {
            this.m_bodies[bodyIdx].SetAwake(false);
        }
    }
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} subStep
 */
Box2D.Dynamics.b2Island.prototype.SolveTOI = function(subStep) {
    var i = 0;
    var j = 0;
    this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contacts.length);
    var contactSolver = this.m_contactSolver;
    for (i = 0; i < this.m_joints.length; ++i) {
        this.m_joints[i].InitVelocityConstraints(subStep);
    }
    for (i = 0; i < subStep.velocityIterations; ++i) {
        contactSolver.SolveVelocityConstraints();
        for (j = 0; j < this.m_joints.length; ++j) {
            this.m_joints[j].SolveVelocityConstraints(subStep);
        }
    }
    for (i = 0; i < this.m_nonStaticBodies.length; ++i) {
        var b = this.m_nonStaticBodies[i];
        var translationX = subStep.dt * b.m_linearVelocity.x;
        var translationY = subStep.dt * b.m_linearVelocity.y;
        if ((translationX * translationX + translationY * translationY) > Box2D.Common.b2Settings.b2_maxTranslationSquared) {
            b.m_linearVelocity.Normalize();
            b.m_linearVelocity.x *= Box2D.Common.b2Settings.b2_maxTranslation * subStep.inv_dt;
            b.m_linearVelocity.y *= Box2D.Common.b2Settings.b2_maxTranslation * subStep.inv_dt;
        }
        var rotation = subStep.dt * b.m_angularVelocity;
        if (rotation * rotation > Box2D.Common.b2Settings.b2_maxRotationSquared) {
            if (b.m_angularVelocity < 0.0) {
                b.m_angularVelocity = (-Box2D.Common.b2Settings.b2_maxRotation * subStep.inv_dt);
            } else {
                b.m_angularVelocity = Box2D.Common.b2Settings.b2_maxRotation * subStep.inv_dt;
            }
        }
        b.m_sweep.c0.SetV(b.m_sweep.c);
        b.m_sweep.a0 = b.m_sweep.a;
        b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
        b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
        b.m_sweep.a += subStep.dt * b.m_angularVelocity;
        b.SynchronizeTransform();
    }
    var k_toiBaumgarte = 0.75;
    for (i = 0; i < subStep.positionIterations; ++i) {
        var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
        var jointsOkay = true;
        for (j = 0; j < this.m_joints.length; ++j) {
            var jointOkay = this.m_joints[j].SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte);
            jointsOkay = jointsOkay && jointOkay;
        }
        if (contactsOkay && jointsOkay) {
            break;
        }
    }
    this.Report(contactSolver.m_constraints);
};
/**
 * @param {Array.<!Box2D.Dynamics.Contacts.b2ContactConstraint>} constraints
 */
Box2D.Dynamics.b2Island.prototype.Report = function(constraints) {
    if (this.m_listener == null) {
        return;
    }
    for (var i = 0; i < this.m_contacts.length; ++i) {
        var c = this.m_contacts[i];
        var cc = constraints[i];
        var impulse = new Box2D.Dynamics.b2ContactImpulse();
        for (var j = 0; j < cc.pointCount; ++j) {
            impulse.normalImpulses[j] = cc.points[j].normalImpulse;
            impulse.tangentImpulses[j] = cc.points[j].tangentImpulse;
        }
        this.m_listener.PostSolve(c, impulse);
    }
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.b2Island.prototype.AddBody = function(body) {
    this.m_bodies.push(body);
    if (body.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody) {
        this.m_nonStaticBodies.push(body);
        if (body.GetType() == Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
            this.m_dynamicBodies.push(body);
        }
    }
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 */
Box2D.Dynamics.b2Island.prototype.AddContact = function(contact) {
    this.m_contacts.push(contact);
};
/**
 * @param {!Box2D.Dynamics.Joints.b2Joint} joint
 */
Box2D.Dynamics.b2Island.prototype.AddJoint = function(joint) {
    this.m_joints.push(joint);
};
/**
 * @param {number} dt
 * @param {number} dtRatio
 * @param {number} positionIterations
 * @param {number} velocityIterations
 * @param {boolean} warmStarting
 * @constructor
 */
Box2D.Dynamics.b2TimeStep = function(dt, dtRatio, positionIterations, velocityIterations, warmStarting) {
    /**
     * @const
     * @type {number}
     */
    this.dt = dt;
    var invDT = 0;
    if (dt > 0) {
        invDT = 1 / dt;
    }
    /**
     * @const
     * @type {number}
     */
    this.inv_dt = invDT;
    /**
     * @const
     * @type {number}
     */
    this.dtRatio = dtRatio;
    /**
     * @const
     * @type {number}
     */
    this.positionIterations = positionIterations;
    /**
     * @const
     * @type {number}
     */
    this.velocityIterations = velocityIterations;
    /**
     * @const
     * @type {boolean}
     */
    this.warmStarting = warmStarting;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} gravity
 * @param {boolean} doSleep
 * @constructor
 */
Box2D.Dynamics.b2World = function(gravity, doSleep) {
    /**
     * @private
     * @type {!Box2D.Dynamics.b2ContactManager}
     */
    this.m_contactManager = new Box2D.Dynamics.b2ContactManager(this);
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactSolver}
     */
    this.m_contactSolver = new Box2D.Dynamics.Contacts.b2ContactSolver();
    /**
     * @private
     * @type {boolean}
     */
    this.m_isLocked = false;
    /**
     * @private
     * @type {boolean}
     */
    this.m_newFixture = false;
    /**
     * @private
     * @type {Box2D.Dynamics.b2DestructionListener}
     */
    this.m_destructionListener = null;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2BodyList}
     */
    this.bodyList = new Box2D.Dynamics.b2BodyList();
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactList}
     */
     this.contactList = new Box2D.Dynamics.Contacts.b2ContactList();
    /**
     * @private
     * @type {Box2D.Dynamics.Joints.b2Joint}
     */
    this.m_jointList = null;
    /**
     * @private
     * @type {!Box2D.Dynamics.Controllers.b2ControllerList}
     */
    this.controllerList = new Box2D.Dynamics.Controllers.b2ControllerList();
    /**
     * @private
     * @type {number}
     */
    this.m_jointCount = 0;
    /**
     * @private
     * @type {boolean}
     */
    this.m_warmStarting = true;
    /**
     * @private
     * @type {boolean}
     */
    this.m_continuousPhysics = true;
    /**
     * @private
     * @type {boolean}
     */
    this.m_allowSleep = doSleep;
    /**
     * @private
     * @type {!Box2D.Common.Math.b2Vec2}
     */
    this.m_gravity = gravity;
    /**
     * @private
     * @type {number}
     */
    this.m_inv_dt0 = 0.0;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2Body}
     */
    this.m_groundBody = this.CreateBody(new Box2D.Dynamics.b2BodyDef());
};
/**
 * @const
 * @type {number}
 */
Box2D.Dynamics.b2World.MAX_TOI = 1.0 - 100.0 * Number.MIN_VALUE;
/**
 * @param {!Box2D.Dynamics.b2DestructionListener} listener
 */
Box2D.Dynamics.b2World.prototype.SetDestructionListener = function(listener) {
    this.m_destructionListener = listener;
};
/**
 * @param {!Box2D.Dynamics.b2ContactFilter} filter
 */
Box2D.Dynamics.b2World.prototype.SetContactFilter = function(filter) {
    this.m_contactManager.m_contactFilter = filter;
};
/**
 * @param {!Box2D.Dynamics.b2ContactListener} listener
 */
Box2D.Dynamics.b2World.prototype.SetContactListener = function(listener) {
    this.m_contactManager.m_contactListener = listener;
};
/**
 * @param {!Box2D.Collision.b2DynamicTreeBroadPhase} broadPhase
 */
Box2D.Dynamics.b2World.prototype.SetBroadPhase = function(broadPhase) {
    var oldBroadPhase = this.m_contactManager.m_broadPhase;
    this.m_contactManager.m_broadPhase = broadPhase;
    for (var node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); node; node = node.GetNextNode()) {
        for (var fixtureNode = node.body.GetFixtureList().GetFirstNode(); fixtureNode; fixtureNode = fixtureNode.GetNextNode()) {
            var f = fixtureNode.fixture;
            f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f);
        }
    }
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2World.prototype.GetProxyCount = function() {
    return this.m_contactManager.m_broadPhase.GetProxyCount();
};
/**
 * @param {!Box2D.Dynamics.b2BodyDef} def
 * @return {!Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.b2World.prototype.CreateBody = function(def) {
;
    var b = new Box2D.Dynamics.b2Body(def, this);
    this.bodyList.AddBody(b);
    return b;
};
/**
 * @param {!Box2D.Dynamics.b2Body} b
 */
Box2D.Dynamics.b2World.prototype.DestroyBody = function(b) {
;
    var jn = b.m_jointList;
    while (jn) {
        var jn0 = jn;
        jn = jn.next;
        if (this.m_destructionListener) {
            this.m_destructionListener.SayGoodbyeJoint(jn0.joint);
        }
        this.DestroyJoint(jn0.joint);
    }
    for (var node = b.GetControllerList().GetFirstNode(); node; node = node.GetNextNode()) {
        node.controller.RemoveBody(b);
    }
    for (var contactNode = b.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        this.m_contactManager.Destroy(contactNode.contact);
    }
    for (var fixtureNode = b.GetFixtureList().GetFirstNode(); fixtureNode; fixtureNode = fixtureNode.GetNextNode()) {
        if (this.m_destructionListener) {
            this.m_destructionListener.SayGoodbyeFixture(fixtureNode.fixture);
        }
        b.DestroyFixture(fixtureNode.fixture);
    }
    b.Destroy();
    this.bodyList.RemoveBody(b);
};
/**
 * @param {!Box2D.Dynamics.Joints.b2JointDef} def
 * @return {!Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.b2World.prototype.CreateJoint = function(def) {
    var j = Box2D.Dynamics.Joints.b2Joint.Create(def);
    j.m_prev = null;
    j.m_next = this.m_jointList;
    if (this.m_jointList) {
        this.m_jointList.m_prev = j;
    }
    this.m_jointList = j;
    this.m_jointCount++;
    j.m_edgeA.joint = j;
    j.m_edgeA.other = j.m_bodyB;
    j.m_edgeA.prev = null;
    j.m_edgeA.next = j.m_bodyA.m_jointList;
    if (j.m_bodyA.m_jointList) {
        j.m_bodyA.m_jointList.prev = j.m_edgeA;
    }
    j.m_bodyA.m_jointList = j.m_edgeA;
    j.m_edgeB.joint = j;
    j.m_edgeB.other = j.m_bodyA;
    j.m_edgeB.prev = null;
    j.m_edgeB.next = j.m_bodyB.m_jointList;
    if (j.m_bodyB.m_jointList) {
        j.m_bodyB.m_jointList.prev = j.m_edgeB;
    }
    j.m_bodyB.m_jointList = j.m_edgeB;
    var bodyA = def.bodyA;
    var bodyB = def.bodyB;
    if (!def.collideConnected) {
        for (var contactNode = bodyB.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
            if (contactNode.contact.GetOther(bodyB) == bodyA) {
                contactNode.contact.FlagForFiltering();
            }
        }
    }
    return j;
};
/**
 * @param {!Box2D.Dynamics.Joints.b2Joint} j
 */
Box2D.Dynamics.b2World.prototype.DestroyJoint = function(j) {
    var collideConnected = j.m_collideConnected;
    if (j.m_prev) {
        j.m_prev.m_next = j.m_next;
    }
    if (j.m_next) {
        j.m_next.m_prev = j.m_prev;
    }
    if (j == this.m_jointList) {
        this.m_jointList = j.m_next;
    }
    var bodyA = j.m_bodyA;
    var bodyB = j.m_bodyB;
    bodyA.SetAwake(true);
    bodyB.SetAwake(true);
    if (j.m_edgeA.prev) {
        j.m_edgeA.prev.next = j.m_edgeA.next;
    }
    if (j.m_edgeA.next) {
        j.m_edgeA.next.prev = j.m_edgeA.prev;
    }
    if (j.m_edgeA == bodyA.m_jointList) {
        bodyA.m_jointList = j.m_edgeA.next;
    }
    j.m_edgeA.prev = null;
    j.m_edgeA.next = null;
    if (j.m_edgeB.prev) {
        j.m_edgeB.prev.next = j.m_edgeB.next;
    }
    if (j.m_edgeB.next) {
        j.m_edgeB.next.prev = j.m_edgeB.prev;
    }
    if (j.m_edgeB == bodyB.m_jointList) {
        bodyB.m_jointList = j.m_edgeB.next;
    }
    j.m_edgeB.prev = null;
    j.m_edgeB.next = null;
    this.m_jointCount--;
    if (!collideConnected) {
        for (var contactNode = bodyB.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
            if (contactNode.contact.GetOther(bodyB) == bodyA) {
                contactNode.contact.FlagForFiltering();
            }
        }
    }
};
/**
 * @return {!Box2D.Dynamics.Controllers.b2ControllerList}
 */
Box2D.Dynamics.b2World.prototype.GetControllerList = function() {
    return this.controllerList;
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} c
 * @return {!Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.b2World.prototype.AddController = function(c) {
    if (c.m_world !== null && c.m_world != this) {
        throw new Error("Controller can only be a member of one world");
    }
    this.controllerList.AddController(c);
    c.m_world = this;
    return c;
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} c
 */
Box2D.Dynamics.b2World.prototype.RemoveController = function(c) {
    this.controllerList.RemoveController(c);
    c.m_world = null;
    c.Clear();
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 * @return {!Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.b2World.prototype.CreateController = function(controller) {
    return this.AddController(controller);
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 */
Box2D.Dynamics.b2World.prototype.DestroyController = function(controller) {
    this.RemoveController(controller);
};
/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2World.prototype.SetWarmStarting = function(flag) {
    this.m_warmStarting = flag;
};
/**
 * @param {boolean} flag
 */
Box2D.Dynamics.b2World.prototype.SetContinuousPhysics = function(flag) {
    this.m_continuousPhysics = flag;
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2World.prototype.GetBodyCount = function() {
    return this.bodyList.GetBodyCount();
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2World.prototype.GetJointCount = function() {
    return this.m_jointCount;
};
/**
 * @return {number}
 */
Box2D.Dynamics.b2World.prototype.GetContactCount = function() {
    return this.contactList.GetContactCount();
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} gravity
 */
Box2D.Dynamics.b2World.prototype.SetGravity = function(gravity) {
    this.m_gravity = gravity;
};
/**
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.b2World.prototype.GetGravity = function() {
    return this.m_gravity;
};
/**
 * @return {!Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.b2World.prototype.GetGroundBody = function() {
    return this.m_groundBody;
};
/**
 * @param {number} dt
 * @param {number} velocityIterations
 * @param {number} positionIterations
 */
Box2D.Dynamics.b2World.prototype.Step = function(dt, velocityIterations, positionIterations) {
    if (this.m_newFixture) {
        this.m_contactManager.FindNewContacts();
        this.m_newFixture = false;
    }
    this.m_isLocked = true;
    var step = new Box2D.Dynamics.b2TimeStep(dt, this.m_inv_dt0 * dt /* dtRatio */, velocityIterations, positionIterations, this.m_warmStarting);
    this.m_contactManager.Collide();
    if (step.dt > 0.0) {
        this.Solve(step);
        if (this.m_continuousPhysics) {
            this.SolveTOI(step);
        }
        this.m_inv_dt0 = step.inv_dt;
    }
    this.m_isLocked = false;
};
Box2D.Dynamics.b2World.prototype.ClearForces = function() {
    for (var node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies); node; node = node.GetNextNode()) {
        node.body.m_force.SetZero();
        node.body.m_torque = 0.0;
    }
};
/**
 * @param {function(!Box2D.Dynamics.b2Fixture):boolean} callback
 * @param {!Box2D.Collision.b2AABB} aabb
 */
Box2D.Dynamics.b2World.prototype.QueryAABB = function(callback, aabb) {
    this.m_contactManager.m_broadPhase.Query(callback, aabb);
};
/**
 * @param {function(!Box2D.Dynamics.b2Fixture): boolean} callback
 * @param {!Box2D.Common.Math.b2Vec2} p
 */
Box2D.Dynamics.b2World.prototype.QueryPoint = function(callback, p) {
    /** @type {function(!Box2D.Dynamics.b2Fixture): boolean} */
    var WorldQueryWrapper = function(fixture) {
        if (fixture.TestPoint(p)) {
            return callback(fixture);
        } else {
            return true;
        }
    };
    var aabb = Box2D.Collision.b2AABB.Get();
    aabb.lowerBound_.Set(p.x - Box2D.Common.b2Settings.b2_linearSlop, p.y - Box2D.Common.b2Settings.b2_linearSlop);
    aabb.upperBound_.Set(p.x + Box2D.Common.b2Settings.b2_linearSlop, p.y + Box2D.Common.b2Settings.b2_linearSlop);
    this.m_contactManager.m_broadPhase.Query(WorldQueryWrapper, aabb);
    Box2D.Collision.b2AABB.Free(aabb);
};
/**
 * @param {function(!Box2D.Dynamics.b2Fixture, !Box2D.Common.Math.b2Vec2, !Box2D.Common.Math.b2Vec2, number): number} callback
 * @param {!Box2D.Common.Math.b2Vec2} point1
 * @param {!Box2D.Common.Math.b2Vec2} point2
 */
Box2D.Dynamics.b2World.prototype.RayCast = function(callback, point1, point2) {
    var broadPhase = this.m_contactManager.m_broadPhase;
    var output = new Box2D.Collision.b2RayCastOutput();
    /**
     * @param {!Box2D.Collision.b2RayCastInput} input
     * @param {!Box2D.Dynamics.b2Fixture} fixture
     */
    var RayCastWrapper = function(input, fixture) {
            var hit = fixture.RayCast(output, input);
            if (hit) {
                var flipFrac = 1 - output.fraction;
                var point = Box2D.Common.Math.b2Vec2.Get(flipFrac * point1.x + output.fraction * point2.x, flipFrac * point1.y + output.fraction * point2.y);
                var retVal = callback(fixture, point, output.normal, output.fraction);
                Box2D.Common.Math.b2Vec2.Free(point);
                return retVal;
            } else {
                return input.maxFraction;
            }
        };
    var input = new Box2D.Collision.b2RayCastInput(point1, point2, 1 /* maxFraction */ );
    broadPhase.RayCast(RayCastWrapper, input);
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} point1
 * @param {!Box2D.Common.Math.b2Vec2} point2
 * @return {Box2D.Dynamics.b2Fixture}
 */
Box2D.Dynamics.b2World.prototype.RayCastOne = function(point1, point2) {
    var result = null;
    /**
     * @param {!Box2D.Dynamics.b2Fixture} fixture
     * @param {!Box2D.Common.Math.b2Vec2} point
     * @param {!Box2D.Common.Math.b2Vec2} normal
     * @param {number} fraction
     * @return {number}
     */
    var RayCastOneWrapper = function(fixture, point, normal, fraction) {
        result = fixture;
        return fraction;
    };
    this.RayCast(RayCastOneWrapper, point1, point2);
    return result;
};
/**
 * @param {!Box2D.Common.Math.b2Vec2} point1
 * @param {!Box2D.Common.Math.b2Vec2} point2
 * @return {Array.<Box2D.Dynamics.b2Fixture>}
 */
Box2D.Dynamics.b2World.prototype.RayCastAll = function(point1, point2) {
    var result = [];
    /**
     * @param {!Box2D.Dynamics.b2Fixture} fixture
     * @param {!Box2D.Common.Math.b2Vec2} point
     * @param {!Box2D.Common.Math.b2Vec2} normal
     * @param {number} fraction
     * @return {number}
     */
    var RayCastAllWrapper = function(fixture, point, normal, fraction) {
        result.push(fixture);
        return 1;
    };
    this.RayCast(RayCastAllWrapper, point1, point2);
    return result;
};
/**
 * @return {!Box2D.Dynamics.b2BodyList}
 */
Box2D.Dynamics.b2World.prototype.GetBodyList = function() {
    return this.bodyList;
};
/**
 * @return {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.b2World.prototype.GetJointList = function() {
    return this.m_jointList;
};
/**
 * @return {Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.b2World.prototype.GetContactList = function() {
    return this.contactList;
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.b2World.prototype.IsLocked = function() {
    return this.m_isLocked;
};
var b2solvearray = [];
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 */
Box2D.Dynamics.b2World.prototype.Solve = function(step) {
    for (var controllerNode = this.controllerList.GetFirstNode(); controllerNode; controllerNode = controllerNode.GetNextNode()) {
        controllerNode.controller.Step(step);
    }
    var m_island = new Box2D.Dynamics.b2Island(this.m_contactManager.m_contactListener, this.m_contactSolver);
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        bodyNode.body.m_islandFlag = false;
    }
    for (var contactNode = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        contactNode.contact.m_islandFlag = false;
    }
    for (var j = this.m_jointList; j; j = j.m_next) {
        j.m_islandFlag = false;
    }
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var seed = bodyNode.body;
        if (seed.m_islandFlag) {
            continue;
        }
        m_island.Clear();
		b2solvearray.length = 0;
        var stack = b2solvearray;
        stack.push(seed);
        seed.m_islandFlag = true;
        while (stack.length > 0) {
            var b = stack.pop();
            m_island.AddBody(b);
            if (!b.IsAwake()) {
                b.SetAwake(true);
            }
            if (b.GetType() == Box2D.Dynamics.b2BodyDef.b2_staticBody) {
                continue;
            }
            for (var contactNode = b.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts); contactNode; contactNode = contactNode.GetNextNode()) {
                var contact = contactNode.contact;
                if (contact.m_islandFlag) {
                    continue;
                }
                m_island.AddContact(contact);
                contact.m_islandFlag = true;
                var other = contact.GetOther(b);
                if (other.m_islandFlag) {
                    continue;
                }
                stack.push(other);
                other.m_islandFlag = true;
            }
            for (var jn = b.m_jointList; jn; jn = jn.next) {
                if (jn.joint.m_islandFlag || !jn.other.IsActive()) {
                    continue;
                }
                m_island.AddJoint(jn.joint);
                jn.joint.m_islandFlag = true;
                if (jn.other.m_islandFlag) {
                    continue;
                }
                stack.push(jn.other);
                jn.other.m_islandFlag = true;
            }
        }
        m_island.Solve(step, this.m_gravity, this.m_allowSleep);
    }
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        bodyNode.body.SynchronizeFixtures();
    }
    this.m_contactManager.FindNewContacts();
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 */
Box2D.Dynamics.b2World.prototype.SolveTOI = function(step) {
    var m_island = new Box2D.Dynamics.b2Island(this.m_contactManager.m_contactListener, this.m_contactSolver);
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var b = bodyNode.body;
        b.m_islandFlag = false;
        b.m_sweep.t0 = 0.0;
    }
    for (var contactNode = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        contactNode.contact.m_islandFlag = false;
        contactNode.contact.m_toi = null;
    }
    for (var j = this.m_jointList; j; j = j.m_next) {
        j.m_islandFlag = false;
    }
    while (true) {
        var toi2 = this._SolveTOI2(step);
        var minContact = toi2.minContact;
        var minTOI = toi2.minTOI;
        if (minContact === null || Box2D.Dynamics.b2World.MAX_TOI < minTOI) {
            break;
        }
        var fixtureABody = minContact.m_fixtureA.GetBody();
        var fixtureBBody =  minContact.m_fixtureB.GetBody();
        Box2D.Dynamics.b2World.s_backupA.Set(fixtureABody.m_sweep);
        Box2D.Dynamics.b2World.s_backupB.Set(fixtureBBody.m_sweep);
        fixtureABody.Advance(minTOI);
        fixtureBBody.Advance(minTOI);
        minContact.Update(this.m_contactManager.m_contactListener);
        minContact.m_toi = null;
        if (minContact.sensor || !minContact.enabled) {
            fixtureABody.m_sweep.Set(Box2D.Dynamics.b2World.s_backupA);
            fixtureBBody.m_sweep.Set(Box2D.Dynamics.b2World.s_backupB);
            fixtureABody.SynchronizeTransform();
            fixtureBBody.SynchronizeTransform();
            continue;
        }
        if (!minContact.touching) {
            continue;
        }
        var seed = fixtureABody;
        if (seed.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
            seed = fixtureBBody;
        }
        m_island.Clear();
		b2solvearray.length = 0;
        var queue = b2solvearray;
        queue.push(seed);
        seed.m_islandFlag = true;
        while (queue.length > 0) {
            var b = queue.pop();
            m_island.AddBody(b);
            if (!b.IsAwake()) {
                b.SetAwake(true);
            }
            if (b.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
                continue;
            }
            for (var contactNode = b.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts); contactNode; contactNode = contactNode.GetNextNode()) {
                if (m_island.m_contactCount == Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland) {
                    break;
                }
                var contact = contactNode.contact;
                if (contact.m_islandFlag) {
                    continue;
                }
                m_island.AddContact(contact);
                contact.m_islandFlag = true;
                var other = contact.GetOther(b);
                if (other.m_islandFlag) {
                    continue;
                }
                if (other.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody) {
                    other.Advance(minTOI);
                    other.SetAwake(true);
                    queue.push(other);
                }
                other.m_islandFlag = true;
            }
            for (var jEdge = b.m_jointList; jEdge; jEdge = jEdge.next) {
                if (m_island.m_jointCount == Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland) {
                    continue;
                }
                if (jEdge.joint.m_islandFlag || !jEdge.other.IsActive()) {
                    continue;
                }
                m_island.AddJoint(jEdge.joint);
                jEdge.joint.m_islandFlag = true;
                if (jEdge.other.m_islandFlag) {
                    continue;
                }
                if (jEdge.other.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody) {
                    jEdge.other.Advance(minTOI);
                    jEdge.other.SetAwake(true);
                    queue.push(jEdge.other);
                }
                jEdge.other.m_islandFlag = true;
            }
        }
        m_island.SolveTOI(new Box2D.Dynamics.b2TimeStep((1.0 - minTOI) * step.dt /* dt */, 0 /* dtRatio */, step.velocityIterations, step.positionIterations, false /* warmStarting */));
        for (var i = 0; i < m_island.m_bodies.length; i++) {
            m_island.m_bodies[i].m_islandFlag = false;
            if (!m_island.m_bodies[i].IsAwake() || m_island.m_bodies[i].GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) {
                continue;
            }
            m_island.m_bodies[i].SynchronizeFixtures();
            for (var contactNode = m_island.m_bodies[i].contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); contactNode; contactNode = contactNode.GetNextNode()) {
                contactNode.contact.m_toi = null;
            }
        }
        for (var i = 0; i < m_island.m_contactCount; i++) {
            m_island.m_contacts[i].m_islandFlag = false;
            m_island.m_contacts[i].m_toi = null;
        }
        for (var i = 0; i < m_island.m_jointCount; i++) {
            m_island.m_joints[i].m_islandFlag = false;
        }
        this.m_contactManager.FindNewContacts();
    }
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @return {{minContact: Box2D.Dynamics.Contacts.b2Contact, minTOI: number}}
 */
Box2D.Dynamics.b2World.prototype._SolveTOI2 = function(step) {
    var minContact = null;
    var minTOI = 1.0;
    var contacts = 0;
    for (var contactNode = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts); contactNode; contactNode = contactNode.GetNextNode()) {
        var c = contactNode.contact;
        if (this._SolveTOI2SkipContact(step, c)) {
            continue;
        }
        var toi = 1.0;
        if (c.m_toi != null) {
            toi = c.m_toi;
        } else if (c.touching) {
            toi = 1;
            c.m_toi = toi;
        } else {
            var fixtureABody = c.m_fixtureA.GetBody();
            var fixtureBBody = c.m_fixtureB.GetBody();
            var t0 = fixtureABody.m_sweep.t0;
            if (fixtureABody.m_sweep.t0 < fixtureBBody.m_sweep.t0) {
                t0 = fixtureBBody.m_sweep.t0;
                fixtureABody.m_sweep.Advance(t0);
            } else if (fixtureBBody.m_sweep.t0 < fixtureABody.m_sweep.t0) {
                t0 = fixtureABody.m_sweep.t0;
                fixtureBBody.m_sweep.Advance(t0);
            }
            toi = c.ComputeTOI(fixtureABody.m_sweep, fixtureBBody.m_sweep);
;
            if (toi > 0.0 && toi < 1.0) {
                toi = (1.0 - toi) * t0 + toi;
            }
            c.m_toi = toi;
        }
        if (Number.MIN_VALUE < toi && toi < minTOI) {
            minContact = c;
            minTOI = toi;
        }
    }
    return {
        minContact: minContact,
        minTOI: minTOI
    };
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @param {!Box2D.Dynamics.Contacts.b2Contact} c
 * @return {boolean}
 */
Box2D.Dynamics.b2World.prototype._SolveTOI2SkipContact = function(step, c) {
    var fixtureABody = c.m_fixtureA.GetBody();
    var fixtureBBody = c.m_fixtureB.GetBody();
    if ((fixtureABody.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || !fixtureABody.IsAwake()) && (fixtureBBody.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || !fixtureBBody.IsAwake())) {
        return true;
    }
    return false;
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 */
Box2D.Dynamics.Contacts.b2Contact = function(fixtureA, fixtureB) {
    /**
     * @const
     * @private
     * @type {string}
     */
    this.ID = "Contact" + Box2D.Dynamics.Contacts.b2Contact.NEXT_ID++;
    /**
     * @private
     * @type {!Box2D.Collision.b2Manifold}
     */
    this.m_manifold = new Box2D.Collision.b2Manifold();
    /**
     * @private
     * @type {!Box2D.Collision.b2Manifold}
     */
    this.m_oldManifold = new Box2D.Collision.b2Manifold();
    /**
     * @private
     * @type {boolean}
     */
    this.touching = false;
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    /**
     * @private
     * @type {boolean}
     */
    this.continuous = (bodyA.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) ||
                      bodyA.IsBullet() ||
                      (bodyB.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) ||
                      bodyB.IsBullet();
    /**
     * @private
     * @type {boolean}
     */
    this.sensor = fixtureA.IsSensor() || fixtureB.IsSensor();
    /**
     * @private
     * @type {boolean}
     */
    this.filtering = false;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2Fixture}
     */
    this.m_fixtureA = fixtureA;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2Fixture}
     */
    this.m_fixtureB = fixtureB;
    /**
     * @private
     * @type {boolean}
     */
    this.enabled = true;
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactList}
     */
    this.bodyAList = bodyA.GetContactList();
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactList}
     */
    this.bodyBList = bodyB.GetContactList();
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2ContactList}
     */
    this.worldList = bodyB.GetWorld().GetContactList();
    this.AddToLists();
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.Reset = function(fixtureA, fixtureB) {
    this.m_manifold.Reset();
    this.m_oldManifold.Reset();
    this.touching = false;
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    this.continuous = (bodyA.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) ||
                      bodyA.IsBullet() ||
                      (bodyB.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody) ||
                      bodyB.IsBullet();
    this.sensor = fixtureA.IsSensor() || fixtureB.IsSensor();
    this.filtering = false;
    this.m_fixtureA = fixtureA;
    this.m_fixtureB = fixtureB;
    this.enabled = true;
    this.bodyAList = bodyA.GetContactList();
    this.bodyBList = bodyB.GetContactList();
    this.worldList = bodyB.GetWorld().GetContactList();
    this.AddToLists();
};
Box2D.Dynamics.Contacts.b2Contact.prototype.AddToLists = function () {
    this.bodyAList.AddContact(this);
    this.bodyBList.AddContact(this);
    this.worldList.AddContact(this);
    this.UpdateLists();
};
Box2D.Dynamics.Contacts.b2Contact.prototype.UpdateLists = function () {
    var nonSensorEnabledTouching = false;
    var nonSensorEnabledContinuous = false;
    if (!this.IsSensor() && this.IsEnabled()) {
        if (this.IsTouching()) {
            nonSensorEnabledTouching = true;
        }
        if (this.IsContinuous()) {
            nonSensorEnabledContinuous = true;
        }
    }
    this.bodyAList.UpdateContact(this, nonSensorEnabledTouching, nonSensorEnabledContinuous);
    this.bodyBList.UpdateContact(this, nonSensorEnabledTouching, nonSensorEnabledContinuous);
    this.worldList.UpdateContact(this, nonSensorEnabledTouching, nonSensorEnabledContinuous);
};
Box2D.Dynamics.Contacts.b2Contact.prototype.RemoveFromLists = function () {
    this.bodyAList.RemoveContact(this);
    this.bodyBList.RemoveContact(this);
    this.worldList.RemoveContact(this);
};
/**
 * @return {!Box2D.Collision.b2Manifold}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.GetManifold = function () {
  return this.m_manifold;
};
/**
 * @param {!Box2D.Collision.b2WorldManifold} worldManifold
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.GetWorldManifold = function (worldManifold) {
    var bodyA = this.m_fixtureA.GetBody();
    var bodyB = this.m_fixtureB.GetBody();
    var shapeA = this.m_fixtureA.GetShape();
    var shapeB = this.m_fixtureB.GetShape();
    worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius);
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.IsTouching = function () {
  return this.touching;
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.IsContinuous = function () {
  return this.continuous;
};
/**
 * @param {boolean} sensor
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.SetSensor = function (sensor) {
   this.sensor = sensor;
   this.UpdateLists();
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.IsSensor = function () {
  return this.sensor;
};
/**
 * @param {boolean} flag
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.SetEnabled = function (flag) {
   this.enabled = flag;
   this.UpdateLists();
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.IsEnabled = function () {
   return this.enabled;
};
/**
 * @return {Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.GetNext = function () {
  return this.m_next;
};
/**
 * @return {!Box2D.Dynamics.b2Fixture}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.GetFixtureA = function () {
  return this.m_fixtureA;
};
/**
 * @return {!Box2D.Dynamics.b2Fixture}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.GetFixtureB = function () {
  return this.m_fixtureB;
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 * @return {!Box2D.Dynamics.b2Body}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.GetOther = function (body) {
    var bodyA = this.m_fixtureA.GetBody();
    if (bodyA != body) {
        return bodyA;
    } else {
        return this.m_fixtureB.GetBody();
    }
};
Box2D.Dynamics.Contacts.b2Contact.prototype.FlagForFiltering = function () {
   this.filtering = true;
};
Box2D.Dynamics.Contacts.b2Contact.prototype.ClearFiltering = function () {
   this.filtering = false;
};
/**
 * @return {boolean}
 */
Box2D.Dynamics.Contacts.b2Contact.prototype.IsFiltering = function () {
   return this.filtering;
};
Box2D.Dynamics.Contacts.b2Contact.prototype.Update = function (listener) {
  var tManifold = this.m_oldManifold;
  this.m_oldManifold = this.m_manifold;
  this.m_manifold = tManifold;
  this.enabled = true;
  var touching = false;
  var wasTouching = this.IsTouching();
  var bodyA = this.m_fixtureA.GetBody();
  var bodyB = this.m_fixtureB.GetBody();
  var aabbOverlap = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
  if (this.sensor) {
     if (aabbOverlap) {
        touching = Box2D.Collision.Shapes.b2Shape.TestOverlap(this.m_fixtureA.GetShape(), bodyA.GetTransform(), this.m_fixtureB.GetShape(), bodyB.GetTransform());
     }
     this.m_manifold.m_pointCount = 0;
  } else {
     if (bodyA.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || bodyB.IsBullet()) {
        this.continuous = true;
     } else {
        this.continuous = false;
     }
     if (aabbOverlap) {
        this.Evaluate();
        touching = this.m_manifold.m_pointCount > 0;
        for (var i = 0; i < this.m_manifold.m_pointCount; i++) {
           var mp2 = this.m_manifold.m_points[i];
           mp2.m_normalImpulse = 0.0;
           mp2.m_tangentImpulse = 0.0;
           for (var j = 0; j < this.m_oldManifold.m_pointCount; j++) {
              var mp1 = this.m_oldManifold.m_points[j];
              if (mp1.m_id.GetKey() == mp2.m_id.GetKey()) {
                 mp2.m_normalImpulse = mp1.m_normalImpulse;
                 mp2.m_tangentImpulse = mp1.m_tangentImpulse;
                 break;
              }
           }
        }
     } else {
        this.m_manifold.m_pointCount = 0;
     }
     if (touching != wasTouching) {
        bodyA.SetAwake(true);
        bodyB.SetAwake(true);
     }
  }
  this.touching = touching;
  if (touching != wasTouching) {
     this.UpdateLists();
  }
  if (!wasTouching && touching) {
     listener.BeginContact(this);
  }
  if (wasTouching && !touching) {
     listener.EndContact(this);
  }
  if (!this.sensor) {
     listener.PreSolve(this, this.m_oldManifold);
  }
};
Box2D.Dynamics.Contacts.b2Contact.prototype.Evaluate = function () {};
Box2D.Dynamics.Contacts.b2Contact.prototype.ComputeTOI = function (sweepA, sweepB) {
  Box2D.Dynamics.Contacts.b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
  Box2D.Dynamics.Contacts.b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
  Box2D.Dynamics.Contacts.b2Contact.s_input.sweepA = sweepA;
  Box2D.Dynamics.Contacts.b2Contact.s_input.sweepB = sweepB;
  Box2D.Dynamics.Contacts.b2Contact.s_input.tolerance = Box2D.Common.b2Settings.b2_linearSlop;
  return Box2D.Collision.b2TimeOfImpact.TimeOfImpact(Box2D.Dynamics.Contacts.b2Contact.s_input);
};
Box2D.Dynamics.Contacts.b2Contact.s_input = new Box2D.Collision.b2TOIInput();
/**
 * @type {number}
 * @private
 */
Box2D.Dynamics.Contacts.b2Contact.NEXT_ID = 0;
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 * @extends {Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.Contacts.b2CircleContact = function(fixtureA, fixtureB) {
    Box2D.Dynamics.Contacts.b2Contact.call(this, fixtureA, fixtureB);
};
c2inherit(Box2D.Dynamics.Contacts.b2CircleContact, Box2D.Dynamics.Contacts.b2Contact);
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.Contacts.b2CircleContact.prototype.Reset = function(fixtureA, fixtureB) {
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
};
Box2D.Dynamics.Contacts.b2CircleContact.prototype.Evaluate = function() {
    Box2D.Collision.b2Collision.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf);
};
/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactConstraint = function() {
    this.localPlaneNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normalMass = new Box2D.Common.Math.b2Mat22();
    this.K = new Box2D.Common.Math.b2Mat22();
    this.points = [];
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; i++) {
        this.points[i] = new Box2D.Dynamics.Contacts.b2ContactConstraintPoint();
    }
};
/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactConstraintPoint = function() {
      this.localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
      this.rA = Box2D.Common.Math.b2Vec2.Get(0, 0);
      this.rB = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
Box2D.Dynamics.Contacts.b2ContactConstraintPoint.prototype.Reset = function() {
    this.localPoint.Set(0, 0);
    this.rA.Set(0, 0);
    this.rB.Set(0, 0);
};
/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactFactory = function() {
    /**
     * @private
     */
    this.m_registers = {};
    /**
     * @private
     * @type {Object.<Object.<Array.<!Box2D.Dynamics.b2Contact>>>}
     */
    this.m_freeContacts = {};
    this.AddType(Box2D.Dynamics.Contacts.b2CircleContact, Box2D.Collision.Shapes.b2CircleShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolyAndCircleContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolygonContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2PolygonShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2EdgeAndCircleContact, Box2D.Collision.Shapes.b2EdgeShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolyAndEdgeContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2EdgeShape.NAME);
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.AddType = function(ctor, type1, type2) {
    this.m_freeContacts[type1] = this.m_freeContacts[type1] || {};
    this.m_freeContacts[type1][type2] = this.m_freeContacts[type1][type2] || [];
    this.m_registers[type1] = this.m_registers[type1] || {};
    this.m_registers[type1][type2] = new Box2D.Dynamics.Contacts.b2ContactRegister();
    this.m_registers[type1][type2].ctor = ctor;
    this.m_registers[type1][type2].primary = true;
    if (type1 != type2) {
        this.m_registers[type2] = this.m_registers[type2] || {};
        this.m_registers[type2][type1] = new Box2D.Dynamics.Contacts.b2ContactRegister();
        this.m_registers[type2][type1].ctor = ctor;
        this.m_registers[type2][type1].primary = false;
    }
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.Create = function(fixtureA, fixtureB) {
    var type1 = fixtureA.GetShape().GetTypeName();
    var type2 = fixtureB.GetShape().GetTypeName();
    var reg = this.m_registers[type1][type2];
    var ctor = reg.ctor;
    if (ctor != null) {
        if (reg.primary) {
            if (this.m_freeContacts[type1][type2].length > 0) {
                var c = this.m_freeContacts[type1][type2].pop();
                c.Reset(fixtureA, fixtureB);
                return c;
            }
            return new ctor(fixtureA, fixtureB);
        } else {
            if (this.m_freeContacts[type2][type1].length > 0) {
                var c = this.m_freeContacts[type2][type1].pop();
                c.Reset(fixtureB, fixtureA);
                return c;
            }
            return new ctor(fixtureB, fixtureA);
        }
    } else {
        return null;
    }
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.Destroy = function(contact) {
    var type1 = contact.m_fixtureA.GetShape().GetTypeName();
    var type2 = contact.m_fixtureB.GetShape().GetTypeName();
    this.m_freeContacts[type1][type2].push(contact);
};
/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactList = function() {
    /**
     * @private
     * @type {Array.<Box2D.Dynamics.Contacts.b2ContactListNode>}
     */
    this.contactFirstNodes = [];
    for(var i = 0; i <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; i++) {
        this.contactFirstNodes[i] = null;
    }
    /**
     * @private
     * @type {Array.<Box2D.Dynamics.Contacts.b2ContactListNode>}
     */
    this.contactLastNodes = [];
    for(var i = 0; i <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; i++) {
        this.contactLastNodes[i] = null;
    }
    /**
     * @private
     * @type {Object.<Array.<Box2D.Dynamics.Contacts.b2ContactListNode>>}
     */
    this.contactNodeLookup = {};
    /**
     * @private
     * @type {number}
     */
    this.contactCount = 0;
};
/**
 * @param {number} type
 * @return {Box2D.Dynamics.Contacts.b2ContactListNode}
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.GetFirstNode = function(type) {
    return this.contactFirstNodes[type];
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.AddContact = function(contact) {
    var contactID = contact.ID;
    if (this.contactNodeLookup[contactID] == null) {
        this.contactNodeLookup[contactID] = [];
        for(var i = 0; i <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; i++) {
            this.contactNodeLookup[contactID][i] = null;
        }
        this.CreateNode(contact, contactID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts);
        this.contactCount++;
    }
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.UpdateContact = function(contact, nonSensorEnabledTouching, nonSensorEnabledContinuous) {
    if (nonSensorEnabledTouching) {
        this.CreateNode(contact, contact.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts);
    } else {
        this.RemoveNode(contact.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts);
    }
    if (nonSensorEnabledContinuous) {
        this.CreateNode(contact, contact.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts);
    } else {
        this.RemoveNode(contact.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts);
    }
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.RemoveContact = function(contact) {
    var contactID = contact.ID;
    if (this.contactNodeLookup[contactID] != null) {
        for(var i = 0; i <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; i++) {
            this.RemoveNode(contactID, i);
        }
        delete this.contactNodeLookup[contactID];
        this.contactCount--;
    }
};
/**
 * @param {string} contactID
 * @param {number} type
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.RemoveNode = function(contactID, type) {
    var nodeList = this.contactNodeLookup[contactID];
    if (nodeList == null) {
        return;
    }
    var node = nodeList[type];
    if (node == null) {
        return;
    }
    nodeList[type] = null;
    var prevNode = node.GetPreviousNode();
    var nextNode = node.GetNextNode();
    if (prevNode == null) {
        this.contactFirstNodes[type] = nextNode;
    } else {
        prevNode.SetNextNode(nextNode);
    }
    if (nextNode == null) {
        this.contactLastNodes[type] = prevNode;
    } else {
        nextNode.SetPreviousNode(prevNode);
    }
    Box2D.Dynamics.Contacts.b2ContactListNode.FreeNode(node);
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 * @param {string} contactID
 * @param {number} type
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.CreateNode = function(contact, contactID, type) {
    var nodeList = this.contactNodeLookup[contactID];
    if (nodeList[type] == null) {
        nodeList[type] = Box2D.Dynamics.Contacts.b2ContactListNode.GetNode(contact);
        var prevNode = this.contactLastNodes[type];
        if (prevNode != null) {
            prevNode.SetNextNode(nodeList[type]);
            nodeList[type].SetPreviousNode(prevNode);
        } else {
            this.contactFirstNodes[type] = nodeList[type];
        }
        this.contactLastNodes[type] = nodeList[type];
    }
};
/**
 * @return {number}
 */
Box2D.Dynamics.Contacts.b2ContactList.prototype.GetContactCount = function() {
    return this.contactCount;
};
/**
 * @enum {number}
 */
Box2D.Dynamics.Contacts.b2ContactList.TYPES = {
    nonSensorEnabledTouchingContacts: 0,
    nonSensorEnabledContinuousContacts: 1,
    allContacts: 2 // Assumed to be last by above code
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactListNode = function(contact) {
    /**
     * @private
     * @type {!Box2D.Dynamics.Contacts.b2Contact}
     */
    this.contact = contact;
    /**
     * @private
     * @type {Box2D.Dynamics.Contacts.b2ContactListNode}
     */
    this.next = null;
    /**
     * @private
     * @type {Box2D.Dynamics.Contacts.b2ContactListNode}
     */
    this.previous = null;
};
/**
 * @private
 * @type {Array.<!Box2D.Dynamics.Contacts.b2ContactListNode>
 */
Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes = [];
/**
 * @param {!Box2D.Dynamics.Contacts.b2Contact} contact
 * @return {!Box2D.Dynamics.Contacts.b2ContactListNode}
 */
Box2D.Dynamics.Contacts.b2ContactListNode.GetNode = function(contact) {
    if (Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.length > 0) {
        var node = Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.pop();
        node.next = null;
        node.previous = null;
        node.contact = contact;
        return node;
    } else {
        return new Box2D.Dynamics.Contacts.b2ContactListNode(contact);
    }
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2ContactListNode} node
 */
Box2D.Dynamics.Contacts.b2ContactListNode.FreeNode = function(node) {
    Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.push(node);
};
/**
 * @param {Box2D.Dynamics.Contacts.b2ContactListNode} node
 */
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.SetNextNode = function(node) {
    this.next = node;
};
/**
 * @param {Box2D.Dynamics.Contacts.b2ContactListNode} node
 */
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.SetPreviousNode = function(node) {
    this.previous = node;
};
/**
 * @return {!Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetContact = function() {
    return this.contact;
};
/**
 * @return {Box2D.Dynamics.Contacts.b2ContactListNode}
 */
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetNextNode = function() {
    return this.next;
};
/**
 * @return {Box2D.Dynamics.Contacts.b2ContactListNode}
 */
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetPreviousNode = function() {
    return this.previous;
};
/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactRegister = function () {
    this.pool = null;
    this.poolCount = 0;
};
/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2PositionSolverManifold = function() {
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_separations = [];
    this.m_points = [];
    for (var i = 0; i < Box2D.Common.b2Settings.b2_maxManifoldPoints; i++) {
        this.m_points[i] = Box2D.Common.Math.b2Vec2.Get(0, 0);
    }
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraint} cc
 */
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype.Initialize = function(cc) {
;
    switch (cc.type) {
        case Box2D.Collision.b2Manifold.e_circles:
            this._InitializeCircles(cc);
            break;
        case Box2D.Collision.b2Manifold.e_faceA:
            this._InitializeFaceA(cc);
            break;
        case Box2D.Collision.b2Manifold.e_faceB:
            this._InitializeFaceB(cc);
            break;
    }
};
/**
 * @private
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraint} cc
 */
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeCircles = function(cc) {
    var tMat = cc.bodyA.m_xf.R;
    var tVec = cc.localPoint;
    var pointAX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var pointAY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tMat = cc.bodyB.m_xf.R;
    tVec = cc.points[0].localPoint;
    var pointBX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var pointBY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    var dX = pointBX - pointAX;
    var dY = pointBY - pointAY;
    var d2 = dX * dX + dY * dY;
    if (d2 > Box2D.Common.b2Settings.MIN_VALUE_SQUARED) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d;
    } else {
        this.m_normal.x = 1.0;
        this.m_normal.y = 0.0;
    }
    this.m_points[0].x = 0.5 * (pointAX + pointBX);
    this.m_points[0].y = 0.5 * (pointAY + pointBY);
    this.m_separations[0] = dX * this.m_normal.x + dY * this.m_normal.y - cc.radius;
};
/**
 * @private
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraint} cc
 */
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeFaceA = function(cc) {
    this.m_normal.x = cc.bodyA.m_xf.R.col1.x * cc.localPlaneNormal.x + cc.bodyA.m_xf.R.col2.x * cc.localPlaneNormal.y;
    this.m_normal.y = cc.bodyA.m_xf.R.col1.y * cc.localPlaneNormal.x + cc.bodyA.m_xf.R.col2.y * cc.localPlaneNormal.y;
    var planePointX = cc.bodyA.m_xf.position.x + (cc.bodyA.m_xf.R.col1.x * cc.localPoint.x + cc.bodyA.m_xf.R.col2.x * cc.localPoint.y);
    var planePointY = cc.bodyA.m_xf.position.y + (cc.bodyA.m_xf.R.col1.y * cc.localPoint.x + cc.bodyA.m_xf.R.col2.y * cc.localPoint.y);
    for (var i = 0; i < cc.pointCount; i++) {
        var clipPointX = cc.bodyB.m_xf.position.x + (cc.bodyB.m_xf.R.col1.x * cc.points[i].localPoint.x + cc.bodyB.m_xf.R.col2.x * cc.points[i].localPoint.y);
        var clipPointY = cc.bodyB.m_xf.position.y + (cc.bodyB.m_xf.R.col1.y * cc.points[i].localPoint.x + cc.bodyB.m_xf.R.col2.y * cc.points[i].localPoint.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].x = clipPointX;
        this.m_points[i].y = clipPointY;
    }
};
/**
 * @private
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraint} cc
 */
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeFaceB = function(cc) {
    this.m_normal.x = cc.bodyB.m_xf.R.col1.x * cc.localPlaneNormal.x + cc.bodyB.m_xf.R.col2.x * cc.localPlaneNormal.y;
    this.m_normal.y = cc.bodyB.m_xf.R.col1.y * cc.localPlaneNormal.x + cc.bodyB.m_xf.R.col2.y * cc.localPlaneNormal.y;
    var planePointX = cc.bodyB.m_xf.position.x + (cc.bodyB.m_xf.R.col1.x * cc.localPoint.x + cc.bodyB.m_xf.R.col2.x * cc.localPoint.y);
    var planePointY = cc.bodyB.m_xf.position.y + (cc.bodyB.m_xf.R.col1.y * cc.localPoint.x + cc.bodyB.m_xf.R.col2.y * cc.localPoint.y);
    for (var i = 0; i < cc.pointCount; i++) {
        var clipPointX = cc.bodyA.m_xf.position.x + (cc.bodyA.m_xf.R.col1.x * cc.points[i].localPoint.x + cc.bodyA.m_xf.R.col2.x * cc.points[i].localPoint.y);
        var clipPointY = cc.bodyA.m_xf.position.y + (cc.bodyA.m_xf.R.col1.y * cc.points[i].localPoint.x + cc.bodyA.m_xf.R.col2.y * cc.points[i].localPoint.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].Set(clipPointX, clipPointY);
    }
    this.m_normal.x *= -1;
    this.m_normal.y *= -1;
};
/**
 * @constructor
 */
Box2D.Dynamics.Contacts.b2ContactSolver = function() {
    /**
     * @private
     * @type {Array.<!Box2D.Dynamics.Contacts.b2ContactConstraint>}
     */
    this.m_constraints = [];
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 * @param {Array.<!Box2D.Dynamics.Contacts.b2Contact>} contacts
 * @param {number} contactCount
 */
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.Initialize = function(step, contacts, contactCount) {
    this.m_constraintCount = contactCount;
    while (this.m_constraints.length < this.m_constraintCount) {
        this.m_constraints[this.m_constraints.length] = new Box2D.Dynamics.Contacts.b2ContactConstraint();
    }
    for (var i = 0; i < contactCount; i++) {
        var contact = contacts[i];
        var fixtureA = contact.m_fixtureA;
        var fixtureB = contact.m_fixtureB;
        var shapeA = fixtureA.m_shape;
        var shapeB = fixtureB.m_shape;
        var radiusA = shapeA.m_radius;
        var radiusB = shapeB.m_radius;
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        var manifold = contact.GetManifold();
        var friction = Box2D.Common.b2Settings.b2MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
        var restitution = Box2D.Common.b2Settings.b2MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
        var vAX = bodyA.m_linearVelocity.x;
        var vAY = bodyA.m_linearVelocity.y;
        var vBX = bodyB.m_linearVelocity.x;
        var vBY = bodyB.m_linearVelocity.y;
        var wA = bodyA.m_angularVelocity;
        var wB = bodyB.m_angularVelocity;
;
        Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
        var normalX = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_normal.x;
        var normalY = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_normal.y;
        var cc = this.m_constraints[i];
        cc.bodyA = bodyA;
        cc.bodyB = bodyB;
        cc.manifold = manifold;
        cc.normal.x = normalX;
        cc.normal.y = normalY;
        cc.pointCount = manifold.m_pointCount;
        cc.friction = friction;
        cc.restitution = restitution;
        cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
        cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
        cc.localPoint.x = manifold.m_localPoint.x;
        cc.localPoint.y = manifold.m_localPoint.y;
        cc.radius = radiusA + radiusB;
        cc.type = manifold.m_type;
        for (var k = 0; k < cc.pointCount; ++k) {
            var cp = manifold.m_points[k];
            var ccp = cc.points[k];
            ccp.normalImpulse = cp.m_normalImpulse;
            ccp.tangentImpulse = cp.m_tangentImpulse;
            ccp.localPoint.SetV(cp.m_localPoint);
            var rAX = ccp.rA.x = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
            var rAY = ccp.rA.y = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
            var rBX = ccp.rB.x = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
            var rBY = ccp.rB.y = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
            var rnA = rAX * normalY - rAY * normalX;
            var rnB = rBX * normalY - rBY * normalX;
            rnA *= rnA;
            rnB *= rnB;
            var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
            ccp.normalMass = 1.0 / kNormal;
            var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
            kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
            ccp.equalizedMass = 1.0 / kEqualized;
            var tangentX = normalY;
            var tangentY = (-normalX);
            var rtA = rAX * tangentY - rAY * tangentX;
            var rtB = rBX * tangentY - rBY * tangentX;
            rtA *= rtA;
            rtB *= rtB;
            var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
            ccp.tangentMass = 1.0 / kTangent;
            ccp.velocityBias = 0.0;
            var tX = vBX + ((-wB * rBY)) - vAX - ((-wA * rAY));
            var tY = vBY + (wB * rBX) - vAY - (wA * rAX);
            var vRel = cc.normal.x * tX + cc.normal.y * tY;
            if (vRel < (-Box2D.Common.b2Settings.b2_velocityThreshold)) {
                ccp.velocityBias += (-cc.restitution * vRel);
            }
        }
        if (cc.pointCount == 2) {
            var ccp1 = cc.points[0];
            var ccp2 = cc.points[1];
            var invMassA = bodyA.m_invMass;
            var invIA = bodyA.m_invI;
            var invMassB = bodyB.m_invMass;
            var invIB = bodyB.m_invI;
            var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
            var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
            var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
            var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
            var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
            var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
            var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
            var k_maxConditionNumber = 100.0;
            if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
                cc.K.col1.Set(k11, k12);
                cc.K.col2.Set(k12, k22);
                cc.K.GetInverse(cc.normalMass);
            } else {
                cc.pointCount = 1;
            }
        }
    }
};
/**
 * @param {!Box2D.Dynamics.b2TimeStep} step
 */
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.InitVelocityConstraints = function(step) {
    for (var i = 0; i < this.m_constraintCount; ++i) {
        var c = this.m_constraints[i];
        var bodyA = c.bodyA;
        var bodyB = c.bodyB;
        var invMassA = bodyA.m_invMass;
        var invIA = bodyA.m_invI;
        var invMassB = bodyB.m_invMass;
        var invIB = bodyB.m_invI;
        var normalX = c.normal.x;
        var normalY = c.normal.y;
        var tangentX = normalY;
        var tangentY = (-normalX);
        var tX = 0;
        var j = 0;
        var tCount = 0;
        if (step.warmStarting) {
            tCount = c.pointCount;
            for (j = 0; j < tCount; ++j) {
                var ccp = c.points[j];
                ccp.normalImpulse *= step.dtRatio;
                ccp.tangentImpulse *= step.dtRatio;
                var PX = ccp.normalImpulse * normalX + ccp.tangentImpulse * tangentX;
                var PY = ccp.normalImpulse * normalY + ccp.tangentImpulse * tangentY;
                bodyA.m_angularVelocity -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
                bodyA.m_linearVelocity.x -= invMassA * PX;
                bodyA.m_linearVelocity.y -= invMassA * PY;
                bodyB.m_angularVelocity += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
                bodyB.m_linearVelocity.x += invMassB * PX;
                bodyB.m_linearVelocity.y += invMassB * PY;
            }
        } else {
            tCount = c.pointCount;
            for (j = 0; j < tCount; ++j) {
                var ccp2 = c.points[j];
                ccp2.normalImpulse = 0.0;
                ccp2.tangentImpulse = 0.0;
            }
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints = function() {
    for (var i = 0; i < this.m_constraintCount; i++) {
        this.SolveVelocityConstraints_Constraint(this.m_constraints[i]);
    }
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraint} c
 */
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_Constraint = function(c) {
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    for (var j = 0; j < c.pointCount; j++) {
        Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPoint(c, c.points[j]);
    }
    if (c.pointCount == 1) {
        var ccp = c.points[0];
        var dvX = c.bodyB.m_linearVelocity.x - (c.bodyB.m_angularVelocity * ccp.rB.y) - c.bodyA.m_linearVelocity.x + (c.bodyA.m_angularVelocity * ccp.rA.y);
        var dvY = c.bodyB.m_linearVelocity.y + (c.bodyB.m_angularVelocity * ccp.rB.x) - c.bodyA.m_linearVelocity.y - (c.bodyA.m_angularVelocity * ccp.rA.x);
        var vn = dvX * normalX + dvY * normalY;
        var newImpulse = ccp.normalImpulse - (ccp.normalMass * (vn - ccp.velocityBias));
        newImpulse = newImpulse > 0 ? newImpulse : 0.0;
        var impulseLambda = newImpulse - ccp.normalImpulse;
        var PX = impulseLambda * normalX;
        var PY = impulseLambda * normalY;
        c.bodyA.m_linearVelocity.x -= c.bodyA.m_invMass * PX;
        c.bodyA.m_linearVelocity.y -= c.bodyA.m_invMass * PY;
        c.bodyA.m_angularVelocity -= c.bodyA.m_invI * (ccp.rA.x * PY - ccp.rA.y * PX);
        c.bodyB.m_linearVelocity.x += c.bodyB.m_invMass * PX;
        c.bodyB.m_linearVelocity.y += c.bodyB.m_invMass * PY;
        c.bodyB.m_angularVelocity += c.bodyB.m_invI * (ccp.rB.x * PY - ccp.rB.y * PX);
        ccp.normalImpulse = newImpulse;
    } else {
        var cp1 = c.points[0];
        var cp2 = c.points[1];
        var aX = cp1.normalImpulse;
        var aY = cp2.normalImpulse;
        var dv1X = c.bodyB.m_linearVelocity.x - c.bodyB.m_angularVelocity * cp1.rB.y - c.bodyA.m_linearVelocity.x + c.bodyA.m_angularVelocity * cp1.rA.y;
        var dv1Y = c.bodyB.m_linearVelocity.y + c.bodyB.m_angularVelocity * cp1.rB.x - c.bodyA.m_linearVelocity.y - c.bodyA.m_angularVelocity * cp1.rA.x;
        var dv2X = c.bodyB.m_linearVelocity.x - c.bodyB.m_angularVelocity * cp2.rB.y - c.bodyA.m_linearVelocity.x + c.bodyA.m_angularVelocity * cp2.rA.y;
        var dv2Y = c.bodyB.m_linearVelocity.y + c.bodyB.m_angularVelocity * cp2.rB.x - c.bodyA.m_linearVelocity.y - c.bodyA.m_angularVelocity * cp2.rA.x;
        var bX = (dv1X * normalX + dv1Y * normalY) - cp1.velocityBias;
        var bY = (dv2X * normalX + dv2Y * normalY) - cp2.velocityBias;
        bX -= c.K.col1.x * aX + c.K.col2.x * aY;
        bY -= c.K.col1.y * aX + c.K.col2.y * aY;
        for (;;) {
            var firstX = (-(c.normalMass.col1.x * bX + c.normalMass.col2.x * bY));
            if (firstX >= 0) {
                var firstY = (-(c.normalMass.col1.y * bX + c.normalMass.col2.y * bY));
                if(firstY >= 0) {
                    var dX = firstX - aX;
                    var dY = firstY - aY;
                    this.SolveVelocityConstraints_ConstraintPointUpdate(c, cp1, cp2, firstX - aX, firstY - aY);
                    cp1.normalImpulse = firstX;
                    cp2.normalImpulse = firstY;
                    break;
                }
            }
            var secondX = (-cp1.normalMass * bX);
            if (secondX >= 0) {
                if ((c.K.col1.y * secondX + bY) >= 0) {
                    var dX = secondX - aX;
                    var dY = -aY;
                    this.SolveVelocityConstraints_ConstraintPointUpdate(c, cp1, cp2, secondX - aX, -aY);
                    cp1.normalImpulse = secondX;
                    cp2.normalImpulse = 0;
                    break;
                }
            }
            var secondY = (-cp2.normalMass * bY);
            if (secondY >= 0) {
                if ((c.K.col2.x * secondY + bX) >= 0) {
                    this.SolveVelocityConstraints_ConstraintPointUpdate(c, cp1, cp2, -aX, secondY - aY);
                    cp1.normalImpulse = 0;
                    cp2.normalImpulse = secondY;
                    break;
                }
            }
            if (bX >= 0 && bY >= 0) {
                this.SolveVelocityConstraints_ConstraintPointUpdate(c, cp1, cp2, -aX, -aY);
                cp1.normalImpulse = 0;
                cp2.normalImpulse = 0;
                break;
            }
            break;
        }
    }
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraint} c
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraintPoint} ccp
 */
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPoint = function(c, ccp) {
    var tangentX = c.normal.y;
    var tangentY = -c.normal.x;
    var dvX = c.bodyB.m_linearVelocity.x - c.bodyB.m_angularVelocity * ccp.rB.y - c.bodyA.m_linearVelocity.x + c.bodyA.m_angularVelocity * ccp.rA.y;
    var dvY = c.bodyB.m_linearVelocity.y + c.bodyB.m_angularVelocity * ccp.rB.x - c.bodyA.m_linearVelocity.y - c.bodyA.m_angularVelocity * ccp.rA.x;
    var vt = dvX * tangentX + dvY * tangentY;
    var maxFriction = c.friction * ccp.normalImpulse;
    var newImpulse = Box2D.Common.Math.b2Math.Clamp(ccp.tangentImpulse - ccp.tangentMass * vt, -maxFriction, maxFriction);
    var impulseLambda = newImpulse - ccp.tangentImpulse;
    var PX = impulseLambda * tangentX;
    var PY = impulseLambda * tangentY;
    c.bodyA.m_linearVelocity.x -= c.bodyA.m_invMass * PX;
    c.bodyA.m_linearVelocity.y -= c.bodyA.m_invMass * PY;
    c.bodyA.m_angularVelocity -= c.bodyA.m_invI * (ccp.rA.x * PY - ccp.rA.y * PX);
    c.bodyB.m_linearVelocity.x += c.bodyB.m_invMass * PX;
    c.bodyB.m_linearVelocity.y += c.bodyB.m_invMass * PY;
    c.bodyB.m_angularVelocity += c.bodyB.m_invI * (ccp.rB.x * PY - ccp.rB.y * PX);
    ccp.tangentImpulse = newImpulse;
};
/**
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraint} c
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraintPoint} cp1
 * @param {!Box2D.Dynamics.Contacts.b2ContactConstraintPoint} cp2
 * @param {number} dX
 * @param {number} dY
 */
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPointUpdate = function(c, cp1, cp2, dX, dY) {
    var P1X = dX * c.normal.x;
    var P1Y = dX * c.normal.y;
    var P2X = dY * c.normal.x;
    var P2Y = dY * c.normal.y;
    c.bodyA.m_linearVelocity.x -= c.bodyA.m_invMass * (P1X + P2X);
    c.bodyA.m_linearVelocity.y -= c.bodyA.m_invMass * (P1Y + P2Y);
    c.bodyA.m_angularVelocity -= c.bodyA.m_invI * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
    c.bodyB.m_linearVelocity.x += c.bodyB.m_invMass * (P1X + P2X);
    c.bodyB.m_linearVelocity.y += c.bodyB.m_invMass * (P1Y + P2Y);
    c.bodyB.m_angularVelocity += c.bodyB.m_invI * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
    cp1.normalImpulse = 0;
    cp2.normalImpulse = 0;
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.FinalizeVelocityConstraints = function() {
    for (var i = 0; i < this.m_constraintCount; ++i) {
        var c = this.m_constraints[i];
        var m = c.manifold;
        for (var j = 0; j < c.pointCount; ++j) {
            var point1 = m.m_points[j];
            var point2 = c.points[j];
            point1.m_normalImpulse = point2.normalImpulse;
            point1.m_tangentImpulse = point2.tangentImpulse;
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var minSeparation = 0.0;
    for (var i = 0; i < this.m_constraintCount; i++) {
        var c = this.m_constraints[i];
        var bodyA = c.bodyA;
        var bodyB = c.bodyB;
        var invMassA = bodyA.m_mass * bodyA.m_invMass;
        var invIA = bodyA.m_mass * bodyA.m_invI;
        var invMassB = bodyB.m_mass * bodyB.m_invMass;
        var invIB = bodyB.m_mass * bodyB.m_invI;
        Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.Initialize(c);
        var normal = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_normal;
        for (var j = 0; j < c.pointCount; j++) {
            var ccp = c.points[j];
            var point = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_points[j];
            var separation = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_separations[j];
            var rAX = point.x - bodyA.m_sweep.c.x;
            var rAY = point.y - bodyA.m_sweep.c.y;
            var rBX = point.x - bodyB.m_sweep.c.x;
            var rBY = point.y - bodyB.m_sweep.c.y;
            minSeparation = minSeparation < separation ? minSeparation : separation;
            var C = Box2D.Common.Math.b2Math.Clamp(baumgarte * (separation + Box2D.Common.b2Settings.b2_linearSlop), (-Box2D.Common.b2Settings.b2_maxLinearCorrection), 0.0);
            var impulse = (-ccp.equalizedMass * C);
            var PX = impulse * normal.x;
            var PY = impulse * normal.y;
            bodyA.m_sweep.c.x -= invMassA * PX;
            bodyA.m_sweep.c.y -= invMassA * PY;
            bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
            bodyA.SynchronizeTransform();
            bodyB.m_sweep.c.x += invMassB * PX;
            bodyB.m_sweep.c.y += invMassB * PY;
            bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
            bodyB.SynchronizeTransform();
        }
    }
    return minSeparation > (-1.5 * Box2D.Common.b2Settings.b2_linearSlop);
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolvePositionConstraints_NEW = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var minSeparation = 0.0;
    for (var i = 0; i < this.m_constraintCount; i++) {
        var c = this.m_constraints[i];
        var bodyA = c.bodyA;
        var bodyB = c.bodyB;
        var invMassA = bodyA.m_mass * bodyA.m_invMass;
        var invIA = bodyA.m_mass * bodyA.m_invI;
        var invMassB = bodyB.m_mass * bodyB.m_invMass;
        var invIB = bodyB.m_mass * bodyB.m_invI;
        Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.Initialize(c);
        var normal = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_normal;
        for (var j = 0; j < c.pointCount; j++) {
            var ccp = c.points[j];
            var point = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_points[j];
            var separation = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_separations[j];
            var rAX = point.x - bodyA.m_sweep.c.x;
            var rAY = point.y - bodyA.m_sweep.c.y;
            var rBX = point.x - bodyB.m_sweep.c.x;
            var rBY = point.y - bodyB.m_sweep.c.y;
            if (separation < minSeparation) {
                minSeparation = separation;
            }
            var C = 0;
            if (baumgarte != 0) {
                Box2D.Common.Math.b2Math.Clamp(baumgarte * (separation + Box2D.Common.b2Settings.b2_linearSlop), (-Box2D.Common.b2Settings.b2_maxLinearCorrection), 0.0);
            }
            var impulse = (-ccp.equalizedMass * C);
            var PX = impulse * normal.x;
            var PY = impulse * normal.y;
            bodyA.m_sweep.c.x -= invMassA * PX;
            bodyA.m_sweep.c.y -= invMassA * PY;
            bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
            bodyA.SynchronizeTransform();
            bodyB.m_sweep.c.x += invMassB * PX;
            bodyB.m_sweep.c.y += invMassB * PY;
            bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
            bodyB.SynchronizeTransform();
        }
    }
    return minSeparation > (-1.5 * Box2D.Common.b2Settings.b2_linearSlop);
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 * @extends {Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact = function(fixtureA, fixtureB) {
    Box2D.Dynamics.Contacts.b2Contact.call(this, fixtureA, fixtureB);
};
c2inherit(Box2D.Dynamics.Contacts.b2EdgeAndCircleContact, Box2D.Dynamics.Contacts.b2Contact);
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
};
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.Evaluate = function() {
    var bA = this.m_fixtureA.GetBody();
    var bB = this.m_fixtureB.GetBody();
    this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf);
};
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function(manifold, edge, xf1, circle, xf2) {};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 * @extends {Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.Contacts.b2PolyAndCircleContact = function(fixtureA, fixtureB) {
;
;
    Box2D.Dynamics.Contacts.b2Contact.call(this, fixtureA, fixtureB);
};
c2inherit(Box2D.Dynamics.Contacts.b2PolyAndCircleContact, Box2D.Dynamics.Contacts.b2Contact);
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.Contacts.b2PolyAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
;
;
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
};
Box2D.Dynamics.Contacts.b2PolyAndCircleContact.prototype.Evaluate = function() {
    Box2D.Collision.b2Collision.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf);
};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 * @extends {Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact = function(fixtureA, fixtureB) {
;
;
    Box2D.Dynamics.Contacts.b2Contact.call(this, fixtureA, fixtureB);
};
c2inherit(Box2D.Dynamics.Contacts.b2PolyAndEdgeContact, Box2D.Dynamics.Contacts.b2Contact);
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.Reset = function(fixtureA, fixtureB) {
;
;
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
};
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.Evaluate = function() {
    this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf);
};
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function (manifold, polygon, xf1, edge, xf2) {};
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 * @constructor
 * @extends {Box2D.Dynamics.Contacts.b2Contact}
 */
Box2D.Dynamics.Contacts.b2PolygonContact = function(fixtureA, fixtureB) {
    Box2D.Dynamics.Contacts.b2Contact.call(this, fixtureA, fixtureB);
};
c2inherit(Box2D.Dynamics.Contacts.b2PolygonContact, Box2D.Dynamics.Contacts.b2Contact);
/**
 * @param {!Box2D.Dynamics.b2Fixture} fixtureA
 * @param {!Box2D.Dynamics.b2Fixture} fixtureB
 */
Box2D.Dynamics.Contacts.b2PolygonContact.prototype.Reset = function(fixtureA, fixtureB) {
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
};
Box2D.Dynamics.Contacts.b2PolygonContact.prototype.Evaluate = function() {
    Box2D.Collision.b2Collision.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf);
};
/**
 * @constructor
 */
Box2D.Dynamics.Controllers.b2Controller = function() {
    /**
     * @const
     * @private
     * @type {string}
     */
    this.ID = "Controller" + Box2D.Dynamics.Controllers.b2Controller.NEXT_ID++;
    /**
     * @type {Box2D.Dynamics.b2World}
     */
    this.m_world = null;
    /**
     * @private
     * @type {!Box2D.Dynamics.b2BodyList}
     */
    this.bodyList = new Box2D.Dynamics.b2BodyList();
};
Box2D.Dynamics.Controllers.b2Controller.prototype.Step = function(step) {};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.Controllers.b2Controller.prototype.AddBody = function(body) {
    this.bodyList.AddBody(body);
    body.AddController(this);
};
/**
 * @param {!Box2D.Dynamics.b2Body} body
 */
Box2D.Dynamics.Controllers.b2Controller.prototype.RemoveBody = function(body) {
    this.bodyList.RemoveBody(body);
    body.RemoveController(this);
};
Box2D.Dynamics.Controllers.b2Controller.prototype.Clear = function() {
    for (var node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); node; node = node.GetNextNode()) {
        this.RemoveBody(node.body);
    }
};
/**
 * @return {!Box2D.Dynamics.b2BodyList}
 */
Box2D.Dynamics.Controllers.b2Controller.prototype.GetBodyList = function() {
    return this.bodyList;
};
/**
 * @type {number}
 * @private
 */
Box2D.Dynamics.Controllers.b2Controller.NEXT_ID = 0;
/**
 * @constructor
 * @extends {Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.Controllers.b2BuoyancyController = function() {
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, -1);
    this.offset = 0;
    this.density = 0;
    this.velocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearDrag = 2;
    this.angularDrag = 1;
    this.useDensity = false;
    this.useWorldGravity = true;
    this.gravity = null;
};
c2inherit(Box2D.Dynamics.Controllers.b2BuoyancyController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2BuoyancyController.prototype.Step = function(step) {
    if (this.useWorldGravity) {
        this.gravity = this.m_world.GetGravity().Copy();
    }
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var body = bodyNode.body;
        var areac = Box2D.Common.Math.b2Vec2.Get(0, 0);
        var massc = Box2D.Common.Math.b2Vec2.Get(0, 0);
        var area = 0.0;
        var mass = 0.0;
        for (var fixtureNode = body.GetFixtureList().GetFirstNode(); fixtureNode; fixtureNode = fixtureNode.GetNextNode()) {
            var sc = Box2D.Common.Math.b2Vec2.Get(0, 0);
            var sarea = fixtureNode.fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
            area += sarea;
            areac.x += sarea * sc.x;
            areac.y += sarea * sc.y;
            var shapeDensity = 0;
            if (this.useDensity) {
                shapeDensity = 1;
            } else {
                shapeDensity = 1;
            }
            mass += sarea * shapeDensity;
            massc.x += sarea * sc.x * shapeDensity;
            massc.y += sarea * sc.y * shapeDensity;
        }
        if (area < Number.MIN_VALUE) {
            continue;
        }
        areac.x /= area;
        areac.y /= area;
        massc.x /= mass;
        massc.y /= mass;
        var buoyancyForce = this.gravity.GetNegative();
        buoyancyForce.Multiply(this.density * area);
        body.ApplyForce(buoyancyForce, massc);
        var dragForce = body.GetLinearVelocityFromWorldPoint(areac);
        dragForce.Subtract(this.velocity);
        dragForce.Multiply((-this.linearDrag * area));
        body.ApplyForce(dragForce, areac);
        body.ApplyTorque((-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag));
        Box2D.Common.Math.b2Vec2.Free(areac);
        Box2D.Common.Math.b2Vec2.Free(massc);
    }
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.Controllers.b2ConstantAccelController = function() {
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.A = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
c2inherit(Box2D.Dynamics.Controllers.b2ConstantAccelController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2ConstantAccelController.prototype.Step = function(step) {
    var smallA = Box2D.Common.Math.b2Vec2.Get(this.A.x * step.dt, this.A.y * step.dt);
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var body = bodyNode.body;
        var oldVelocity = body.GetLinearVelocity();
        body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(oldVelocity.x + smallA.x, oldVelocity.y + smallA.y));
    }
    Box2D.Common.Math.b2Vec2.Free(smallA);
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.Controllers.b2ConstantForceController = function() {
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.F = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
c2inherit(Box2D.Dynamics.Controllers.b2ConstantForceController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2ConstantForceController.prototype.Step = function(step) {
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var body = bodyNode.body;
        body.ApplyForce(this.F, body.GetWorldCenter());
    }
};
/**
 * @constructor
 */
Box2D.Dynamics.Controllers.b2ControllerList = function() {
    /**
     * @private
     * @type {Box2D.Dynamics.Controllers.b2ControllerListNode}
     */
    this.controllerFirstNode = null;
    /**
     * @private
     * @type {Box2D.Dynamics.Controllers.b2ControllerListNode}
     */
    this.controllerLastNode = null;
    /**
     * @private
     * @type {Object.<Box2D.Dynamics.Controllers.b2ControllerListNode>}
     */
    this.controllerNodeLookup = {};
    /**
     * @private
     * @type {number}
     */
    this.controllerCount = 0;
};
/**
 * @return {Box2D.Dynamics.Controllers.b2ControllerListNode}
 */
Box2D.Dynamics.Controllers.b2ControllerList.prototype.GetFirstNode = function() {
    return this.controllerFirstNode;
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 */
Box2D.Dynamics.Controllers.b2ControllerList.prototype.AddController = function(controller) {
    var controllerID = controller.ID;
    if (this.controllerNodeLookup[controllerID] == null) {
        var node = new Box2D.Dynamics.Controllers.b2ControllerListNode(controller);
        var prevNode = this.controllerLastNode;
        if (prevNode != null) {
            prevNode.SetNextNode(node);
        } else {
            this.controllerFirstNode = node;
        }
        node.SetPreviousNode(prevNode);
        this.controllerLastNode = node;
        this.controllerNodeLookup[controllerID] = node;
        this.controllerCount++;
    }
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 */
Box2D.Dynamics.Controllers.b2ControllerList.prototype.RemoveController = function(controller) {
    var controllerID = controller.ID;
    var node = this.controllerNodeLookup[controllerID];
    if (node == null) {
        return;
    }
    var prevNode = node.GetPreviousNode();
    var nextNode = node.GetNextNode();
    if (prevNode == null) {
        this.controllerFirstNode = nextNode;
    } else {
        prevNode.SetNextNode(nextNode);
    }
    if (nextNode == null) {
        this.controllerLastNode = prevNode;
    } else {
        nextNode.SetPreviousNode(prevNode);
    }
    delete this.controllerNodeLookup[controllerID];
    this.controllerCount--;
};
/**
 * @return {number}
 */
Box2D.Dynamics.Controllers.b2ControllerList.prototype.GetControllerCount = function() {
    return this.controllerCount;
};
/**
 * @param {!Box2D.Dynamics.Controllers.b2Controller} controller
 * @constructor
 */
Box2D.Dynamics.Controllers.b2ControllerListNode = function(controller) {
    /**
     * @const
     * @type {!Box2D.Dynamics.Controllers.b2Controller}
     */
    this.controller = controller;
    /**
     * @private
     * @type {Box2D.Dynamics.Controllers.b2ControllerListNode}
     */
    this.next = null;
    /**
     * @private
     * @type {Box2D.Dynamics.Controllers.b2ControllerListNode}
     */
    this.previous = null;
};
/**
 * @param {Box2D.Dynamics.Controllers.b2ControllerListNode} node
 */
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.SetNextNode = function(node) {
    this.next = node;
};
/**
 * @param {Box2D.Dynamics.Controllers.b2ControllerListNode} node
 */
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.SetPreviousNode = function(node) {
    this.previous = node;
};
/**
 * @return {Box2D.Dynamics.Controllers.b2ControllerListNode}
 */
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.GetNextNode = function() {
    return this.next;
};
/**
 * @return {Box2D.Dynamics.Controllers.b2ControllerListNode}
 */
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.GetPreviousNode = function() {
    return this.previous;
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.Controllers.b2GravityController = function() {
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.G = 1;
    this.invSqr = true;
};
c2inherit(Box2D.Dynamics.Controllers.b2GravityController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2GravityController.prototype.Step = function(step) {
    var i = null;
    var body1 = null;
    var p1 = null;
    var mass1 = 0;
    var j = null;
    var body2 = null;
    var p2 = null;
    var dx = 0;
    var dy = 0;
    var r2 = 0;
    var f = null;
    if (this.invSqr) {
        for (var body1Node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); body1Node; body1Node = body1Node.GetNextNode()) {
            var body1 = body1Node.body;
            var p1 = body1.GetWorldCenter();
            var mass1 = body1.GetMass();
            for (var body2Node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); body2Node; body2Node = body2Node.GetNextNode()) {
                var body2 = body2Node.body;
                if ( !body1.IsAwake() && !body2.IsAwake() ) {
                    continue;
                }
                var p2 = body2.GetWorldCenter();
                var dx = p2.x - p1.x;
                var dy = p2.y - p1.y;
                var r2 = dx * dx + dy * dy;
                if (r2 < Number.MIN_VALUE) {
                    continue;
                }
                var f = Box2D.Common.Math.b2Vec2.Get(dx, dy);
                f.Multiply(this.G / r2 / Math.sqrt(r2) * mass1 * body2.GetMass());
                if (body1.IsAwake()) {
                    body1.ApplyForce(f, p1);
                }
                f.Multiply(-1);
                if (body2.IsAwake()) {
                    body2.ApplyForce(f, p2);
                }
                Box2D.Common.Math.b2Vec2.Free(f);
            }
        }
    } else {
        for (var body1Node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); body1Node; body1Node = body1Node.GetNextNode()) {
            var body1 = bodyNode.body;
            var p1 = body1.GetWorldCenter();
            var mass1 = body1.GetMass();
            for (var body2Node = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); body2Node; body2Node = body2Node.GetNextNode()) {
                var body2 = bodyNode.body;
                if ( !body1.IsAwake() && !body2.IsAwake() ) {
                    continue;
                }
                var p2 = body2.GetWorldCenter();
                var dx = p2.x - p1.x;
                var dy = p2.y - p1.y;
                var r2 = dx * dx + dy * dy;
                if (r2 < Number.MIN_VALUE) {
                    continue;
                }
                var f = Box2D.Common.Math.b2Vec2.Get(dx, dy);
                f.Multiply(this.G / r2 * mass1 * body2.GetMass());
                if (body1.IsAwake()) {
                    body1.ApplyForce(f, p1);
                }
                f.Multiply(-1);
                if (body2.IsAwake()) {
                    body2.ApplyForce(f, p2);
                }
                Box2D.Common.Math.b2Vec2.Free(f);
            }
        }
    }
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Controllers.b2Controller}
 */
Box2D.Dynamics.Controllers.b2TensorDampingController = function() {
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.T = new Box2D.Common.Math.b2Mat22();
    this.maxTimestep = 0;
};
c2inherit(Box2D.Dynamics.Controllers.b2TensorDampingController, Box2D.Dynamics.Controllers.b2Controller);
/**
 * @param {number} xDamping
 * @param {number} yDamping
 */
Box2D.Dynamics.Controllers.b2TensorDampingController.prototype.SetAxisAligned = function(xDamping, yDamping) {
    this.T.col1.x = (-xDamping);
    this.T.col1.y = 0;
    this.T.col2.x = 0;
    this.T.col2.y = (-yDamping);
    if (xDamping > 0 || yDamping > 0) {
        this.maxTimestep = 1 / Math.max(xDamping, yDamping);
    } else {
        this.maxTimestep = 0;
    }
};
Box2D.Dynamics.Controllers.b2TensorDampingController.prototype.Step = function(step) {
    var timestep = step.dt;
    if (timestep <= Number.MIN_VALUE) return;
    if (timestep > this.maxTimestep && this.maxTimestep > 0) timestep = this.maxTimestep;
    for (var bodyNode = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); bodyNode; bodyNode = bodyNode.GetNextNode()) {
        var body = bodyNode.body;
        var damping = body.GetWorldVector(Box2D.Common.Math.b2Math.MulMV(this.T, body.GetLocalVector(body.GetLinearVelocity())));
        body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(body.GetLinearVelocity().x + damping.x * timestep, body.GetLinearVelocity().y + damping.y * timestep));
    }
};
/**
 * @param {!Box2D.Dynamics.Joints.b2JointDef} def
 * @constructor
 */
Box2D.Dynamics.Joints.b2Joint = function(def) {
    this.m_edgeA = new Box2D.Dynamics.Joints.b2JointEdge();
    this.m_edgeB = new Box2D.Dynamics.Joints.b2JointEdge();
    this.m_localCenterA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localCenterB = Box2D.Common.Math.b2Vec2.Get(0, 0);
;
    this.m_type = def.type;
    this.m_prev = null;
    this.m_next = null;
    this.m_bodyA = def.bodyA;
    this.m_bodyB = def.bodyB;
    this.m_collideConnected = def.collideConnected;
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetType = function() {
    return this.m_type;
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetAnchorA = function() {
    return null;
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetAnchorB = function() {
    return null;
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return null;
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return 0.0;
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetBodyA = function() {
    return this.m_bodyA;
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetBodyB = function() {
    return this.m_bodyB;
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetNext = function() {
    return this.m_next;
};
Box2D.Dynamics.Joints.b2Joint.prototype.IsActive = function() {
    return this.m_bodyA.IsActive() && this.m_bodyB.IsActive();
};
Box2D.Dynamics.Joints.b2Joint.Create = function(def) {
    return def.Create();
};
Box2D.Dynamics.Joints.b2Joint.prototype.InitVelocityConstraints = function(step) {};
Box2D.Dynamics.Joints.b2Joint.prototype.SolveVelocityConstraints = function(step) {};
Box2D.Dynamics.Joints.b2Joint.prototype.FinalizeVelocityConstraints = function() {};
Box2D.Dynamics.Joints.b2Joint.prototype.SolvePositionConstraints = function(baumgarte) {
    return false;
};
Box2D.Dynamics.Joints.b2Joint.e_unknownJoint = 0;
Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint = 1;
Box2D.Dynamics.Joints.b2Joint.e_prismaticJoint = 2;
Box2D.Dynamics.Joints.b2Joint.e_distanceJoint = 3;
Box2D.Dynamics.Joints.b2Joint.e_pulleyJoint = 4;
Box2D.Dynamics.Joints.b2Joint.e_mouseJoint = 5;
Box2D.Dynamics.Joints.b2Joint.e_gearJoint = 6;
Box2D.Dynamics.Joints.b2Joint.e_lineJoint = 7;
Box2D.Dynamics.Joints.b2Joint.e_weldJoint = 8;
Box2D.Dynamics.Joints.b2Joint.e_frictionJoint = 9;
Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit = 0;
Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit = 1;
Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit = 2;
Box2D.Dynamics.Joints.b2Joint.e_equalLimits = 3;
/**
 * @constructor
 */
Box2D.Dynamics.Joints.b2JointDef = function () {
    this.type = Box2D.Dynamics.Joints.b2Joint.e_unknownJoint;
    this.bodyA = null;
    this.bodyB = null;
    this.collideConnected = false;
};
/**
 * @constructor
 */
Box2D.Dynamics.Joints.b2JointEdge = function () {};
/**
 * @param {!Box2D.Dynamics.Joints.b2DistanceJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2DistanceJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_length = def.length;
    this.m_frequencyHz = def.frequencyHz;
    this.m_dampingRatio = def.dampingRatio;
    this.m_impulse = 0.0;
    this.m_gamma = 0.0;
    this.m_bias = 0.0;
};
c2inherit(Box2D.Dynamics.Joints.b2DistanceJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
/**
 * @param {number} inv_dt
 */
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetReactionForce = function(inv_dt) {
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * this.m_impulse * this.m_u.x, inv_dt * this.m_impulse * this.m_u.y);
};
/**
 * @param {number} inv_dt
 */
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetReactionTorque = function(inv_dt) {
    return 0.0;
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetLength = function() {
    return this.m_length;
};
/**
 * @param {number} length
 */
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetLength = function(length) {
    this.m_length = length;
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetFrequency = function() {
    return this.m_frequencyHz;
};
/**
 * @param {number} hz
 */
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetFrequency = function(hz) {
    this.m_frequencyHz = hz;
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetDampingRatio = function() {
    return this.m_dampingRatio;
};
/**
 * @param {number} ratio
 */
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetDampingRatio = function(ratio) {
    this.m_dampingRatio = ratio;
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.InitVelocityConstraints = function(step) {
    var tMat;
    var tX = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    this.m_u.x = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    this.m_u.y = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    var length = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
    if (length > Box2D.Common.b2Settings.b2_linearSlop) {
        this.m_u.Multiply(1.0 / length);
    } else {
        this.m_u.SetZero();
    }
    var cr1u = (r1X * this.m_u.y - r1Y * this.m_u.x);
    var cr2u = (r2X * this.m_u.y - r2Y * this.m_u.x);
    var invMass = bA.m_invMass + bA.m_invI * cr1u * cr1u + bB.m_invMass + bB.m_invI * cr2u * cr2u;
    this.m_mass = invMass != 0.0 ? 1.0 / invMass : 0.0;
    if (this.m_frequencyHz > 0.0) {
        var C = length - this.m_length;
        var omega = 2.0 * Math.PI * this.m_frequencyHz;
        var d = 2.0 * this.m_mass * this.m_dampingRatio * omega;
        var k = this.m_mass * omega * omega;
        this.m_gamma = step.dt * (d + step.dt * k);
        this.m_gamma = this.m_gamma != 0.0 ? 1 / this.m_gamma : 0.0;
        this.m_bias = C * step.dt * k * this.m_gamma;
        this.m_mass = invMass + this.m_gamma;
        this.m_mass = this.m_mass != 0.0 ? 1.0 / this.m_mass : 0.0;
    }
    if (step.warmStarting) {
        this.m_impulse *= step.dtRatio;
        var PX = this.m_impulse * this.m_u.x;
        var PY = this.m_impulse * this.m_u.y;
        bA.m_linearVelocity.x -= bA.m_invMass * PX;
        bA.m_linearVelocity.y -= bA.m_invMass * PY;
        bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
        bB.m_linearVelocity.x += bB.m_invMass * PX;
        bB.m_linearVelocity.y += bB.m_invMass * PY;
        bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX);
    } else {
        this.m_impulse = 0.0;
    }
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SolveVelocityConstraints = function(step) {
    var r1X = this.m_localAnchor1.x - this.m_bodyA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - this.m_bodyA.m_sweep.localCenter.y;
    var tX = (this.m_bodyA.m_xf.R.col1.x * r1X + this.m_bodyA.m_xf.R.col2.x * r1Y);
    r1Y = (this.m_bodyA.m_xf.R.col1.y * r1X + this.m_bodyA.m_xf.R.col2.y * r1Y);
    r1X = tX;
    var r2X = this.m_localAnchor2.x - this.m_bodyB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - this.m_bodyB.m_sweep.localCenter.y;
    tX = (this.m_bodyB.m_xf.R.col1.x * r2X + this.m_bodyB.m_xf.R.col2.x * r2Y);
    r2Y = (this.m_bodyB.m_xf.R.col1.y * r2X + this.m_bodyB.m_xf.R.col2.y * r2Y);
    r2X = tX;
    var v1X = this.m_bodyA.m_linearVelocity.x - this.m_bodyA.m_angularVelocity * r1Y;
    var v1Y = this.m_bodyA.m_linearVelocity.y + this.m_bodyA.m_angularVelocity * r1X;
    var v2X = this.m_bodyB.m_linearVelocity.x - this.m_bodyB.m_angularVelocity * r2Y;
    var v2Y = this.m_bodyB.m_linearVelocity.y + this.m_bodyB.m_angularVelocity * r2X;
    var Cdot = (this.m_u.x * (v2X - v1X) + this.m_u.y * (v2Y - v1Y));
    var impulse = -this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
    this.m_impulse += impulse;
    var PX = impulse * this.m_u.x;
    var PY = impulse * this.m_u.y;
    this.m_bodyA.m_linearVelocity.x -= this.m_bodyA.m_invMass * PX;
    this.m_bodyA.m_linearVelocity.y -= this.m_bodyA.m_invMass * PY;
    this.m_bodyA.m_angularVelocity -= this.m_bodyA.m_invI * (r1X * PY - r1Y * PX);
    this.m_bodyB.m_linearVelocity.x += this.m_bodyB.m_invMass * PX;
    this.m_bodyB.m_linearVelocity.y += this.m_bodyB.m_invMass * PY;
    this.m_bodyB.m_angularVelocity += this.m_bodyB.m_invI * (r2X * PY - r2Y * PX);
};
/**
 * @param {number} baumgarte
 */
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (this.m_frequencyHz > 0.0) {
        return true;
    }
    var r1X = this.m_localAnchor1.x - this.m_bodyA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - this.m_bodyA.m_sweep.localCenter.y;
    var tX = (this.m_bodyA.m_xf.R.col1.x * r1X + this.m_bodyA.m_xf.R.col2.x * r1Y);
    r1Y = (this.m_bodyA.m_xf.R.col1.y * r1X + this.m_bodyA.m_xf.R.col2.y * r1Y);
    r1X = tX;
    var r2X = this.m_localAnchor2.x - this.m_bodyB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - this.m_bodyB.m_sweep.localCenter.y;
    tX = (this.m_bodyB.m_xf.R.col1.x * r2X + this.m_bodyB.m_xf.R.col2.x * r2Y);
    r2Y = (this.m_bodyB.m_xf.R.col1.y * r2X + this.m_bodyB.m_xf.R.col2.y * r2Y);
    r2X = tX;
    var dX = this.m_bodyB.m_sweep.c.x + r2X - this.m_bodyA.m_sweep.c.x - r1X;
    var dY = this.m_bodyB.m_sweep.c.y + r2Y - this.m_bodyA.m_sweep.c.y - r1Y;
    var length = Math.sqrt(dX * dX + dY * dY);
    dX /= length;
    dY /= length;
    var C = Box2D.Common.Math.b2Math.Clamp(length - this.m_length, -Box2D.Common.b2Settings.b2_maxLinearCorrection, Box2D.Common.b2Settings.b2_maxLinearCorrection);
    var impulse = -this.m_mass * C;
    this.m_u.Set(dX, dY);
    var PX = impulse * this.m_u.x;
    var PY = impulse * this.m_u.y;
    this.m_bodyA.m_sweep.c.x -= this.m_bodyA.m_invMass * PX;
    this.m_bodyA.m_sweep.c.y -= this.m_bodyA.m_invMass * PY;
    this.m_bodyA.m_sweep.a -= this.m_bodyA.m_invI * (r1X * PY - r1Y * PX);
    this.m_bodyB.m_sweep.c.x += this.m_bodyB.m_invMass * PX;
    this.m_bodyB.m_sweep.c.y += this.m_bodyB.m_invMass * PY;
    this.m_bodyB.m_sweep.a += this.m_bodyB.m_invI * (r2X * PY - r2Y * PX);
    this.m_bodyA.SynchronizeTransform();
    this.m_bodyB.SynchronizeTransform();
    return Math.abs(C) < Box2D.Common.b2Settings.b2_linearSlop;
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2JointDef}
 */
Box2D.Dynamics.Joints.b2DistanceJointDef = function() {
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_distanceJoint;
    this.length = 1.0;
    this.frequencyHz = 0.0;
    this.dampingRatio = 0.0;
};
c2inherit(Box2D.Dynamics.Joints.b2DistanceJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2DistanceJointDef.prototype.Initialize = function(bA, bB, anchorA, anchorB) {
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchorA));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchorB));
    var dX = anchorB.x - anchorA.x;
    var dY = anchorB.y - anchorA.y;
    this.length = Math.sqrt(dX * dX + dY * dY);
    this.frequencyHz = 0.0;
    this.dampingRatio = 0.0;
};
Box2D.Dynamics.Joints.b2DistanceJointDef.prototype.Create = function() {
    return new Box2D.Dynamics.Joints.b2DistanceJoint(this);
};
/**
 * @param {!Box2D.Dynamics.Joints.b2FrictionJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2FrictionJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_linearMass = new Box2D.Common.Math.b2Mat22();
    this.m_linearImpulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorA.SetV(def.localAnchorA);
    this.m_localAnchorB.SetV(def.localAnchorB);
    this.m_linearMass.SetZero();
    this.m_angularMass = 0.0;
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0.0;
    this.m_maxForce = def.maxForce;
    this.m_maxTorque = def.maxTorque;
};
c2inherit(Box2D.Dynamics.Joints.b2FrictionJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return new b2Vec2(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y);
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return inv_dt * this.m_angularImpulse;
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SetMaxForce = function(force) {
    if (force === undefined) force = 0;
    this.m_maxForce = force;
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetMaxForce = function() {
    return this.m_maxForce;
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SetMaxTorque = function(torque) {
    if (torque === undefined) torque = 0;
    this.m_maxTorque = torque;
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetMaxTorque = function() {
    return this.m_maxTorque;
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.InitVelocityConstraints = function(step) {
    var tMat;
    var tX = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rAX + tMat.col2.x * rAY);
    rAY = (tMat.col1.y * rAX + tMat.col2.y * rAY);
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rBX + tMat.col2.x * rBY);
    rBY = (tMat.col1.y * rBX + tMat.col2.y * rBY);
    rBX = tX;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    var K = new Box2D.Common.Math.b2Mat22();
    K.col1.x = mA + mB;
    K.col2.x = 0.0;
    K.col1.y = 0.0;
    K.col2.y = mA + mB;
    K.col1.x += iA * rAY * rAY;
    K.col2.x += (-iA * rAX * rAY);
    K.col1.y += (-iA * rAX * rAY);
    K.col2.y += iA * rAX * rAX;
    K.col1.x += iB * rBY * rBY;
    K.col2.x += (-iB * rBX * rBY);
    K.col1.y += (-iB * rBX * rBY);
    K.col2.y += iB * rBX * rBX;
    K.GetInverse(this.m_linearMass);
    this.m_angularMass = iA + iB;
    if (this.m_angularMass > 0.0) {
        this.m_angularMass = 1.0 / this.m_angularMass;
    }
    if (step.warmStarting) {
        this.m_linearImpulse.x *= step.dtRatio;
        this.m_linearImpulse.y *= step.dtRatio;
        this.m_angularImpulse *= step.dtRatio;
        var P = this.m_linearImpulse;
        bA.m_linearVelocity.x -= mA * P.x;
        bA.m_linearVelocity.y -= mA * P.y;
        bA.m_angularVelocity -= iA * (rAX * P.y - rAY * P.x + this.m_angularImpulse);
        bB.m_linearVelocity.x += mB * P.x;
        bB.m_linearVelocity.y += mB * P.y;
        bB.m_angularVelocity += iB * (rBX * P.y - rBY * P.x + this.m_angularImpulse);
    } else {
        this.m_linearImpulse.SetZero();
        this.m_angularImpulse = 0.0;
    }
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SolveVelocityConstraints = function(step) {
    var tMat;
    var tX = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var vA = bA.m_linearVelocity;
    var wA = bA.m_angularVelocity;
    var vB = bB.m_linearVelocity;
    var wB = bB.m_angularVelocity;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rAX + tMat.col2.x * rAY);
    rAY = (tMat.col1.y * rAX + tMat.col2.y * rAY);
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rBX + tMat.col2.x * rBY);
    rBY = (tMat.col1.y * rBX + tMat.col2.y * rBY);
    rBX = tX;
    var maxImpulse = 0;
    var Cdot = wB - wA;
    var impulse = (-this.m_angularMass * Cdot);
    var oldImpulse = this.m_angularImpulse;
    maxImpulse = step.dt * this.m_maxTorque;
    this.m_angularImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_angularImpulse + impulse, (-maxImpulse), maxImpulse);
    impulse = this.m_angularImpulse - oldImpulse;
    wA -= iA * impulse;
    wB += iB * impulse;
    var CdotX = vB.x - wB * rBY - vA.x + wA * rAY;
    var CdotY = vB.y + wB * rBX - vA.y - wA * rAX;
    var impulseV = Box2D.Common.Math.b2Math.MulMV(this.m_linearMass, Box2D.Common.Math.b2Vec2.Get((-CdotX), (-CdotY)));
    var oldImpulseV = this.m_linearImpulse.Copy();
    this.m_linearImpulse.Add(impulseV);
    maxImpulse = step.dt * this.m_maxForce;
    if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
        this.m_linearImpulse.Normalize();
        this.m_linearImpulse.Multiply(maxImpulse);
    }
    impulseV = Box2D.Common.Math.b2Math.SubtractVV(this.m_linearImpulse, oldImpulseV);
    vA.x -= mA * impulseV.x;
    vA.y -= mA * impulseV.y;
    wA -= iA * (rAX * impulseV.y - rAY * impulseV.x);
    vB.x += mB * impulseV.x;
    vB.y += mB * impulseV.y;
    wB += iB * (rBX * impulseV.y - rBY * impulseV.x);
    bA.m_angularVelocity = wA;
    bB.m_angularVelocity = wB;
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    return true;
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2JointDef}
 */
Box2D.Dynamics.Joints.b2FrictionJointDef = function() {
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_frictionJoint;
    this.maxForce = 0.0;
    this.maxTorque = 0.0;
};
c2inherit(Box2D.Dynamics.Joints.b2FrictionJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2FrictionJointDef.prototype.Initialize = function (bA, bB, anchor) {
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
};
Box2D.Dynamics.Joints.b2FrictionJointDef.prototype.Create = function() {
    return new Box2D.Dynamics.Joints.b2FrictionJoint(this);
};
/**
 * @param {!Box2D.Dynamics.Joints.b2GearJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2GearJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_groundAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_groundAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_J = new Box2D.Dynamics.Joints.b2Jacobian();
    var type1 = def.joint1.m_type;
    var type2 = def.joint2.m_type;
    this.m_revolute1 = null;
    this.m_prismatic1 = null;
    this.m_revolute2 = null;
    this.m_prismatic2 = null;
    var coordinate1 = 0;
    var coordinate2 = 0;
    this.m_ground1 = def.joint1.GetBodyA();
    this.m_bodyA = def.joint1.GetBodyB();
    if (type1 == Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint) {
        this.m_revolute1 = def.joint1;
        this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);
        this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);
        coordinate1 = this.m_revolute1.GetJointAngle();
    } else {
        this.m_prismatic1 = def.joint1;
        this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);
        this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);
        coordinate1 = this.m_prismatic1.GetJointTranslation();
    }
    this.m_ground2 = def.joint2.GetBodyA();
    this.m_bodyB = def.joint2.GetBodyB();
    if (type2 == Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint) {
        this.m_revolute2 = def.joint2;
        this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);
        this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);
        coordinate2 = this.m_revolute2.GetJointAngle();
    } else {
        this.m_prismatic2 = def.joint2;
        this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);
        this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);
        coordinate2 = this.m_prismatic2.GetJointTranslation();
    }
    this.m_ratio = def.ratio;
    this.m_constant = coordinate1 + this.m_ratio * coordinate2;
    this.m_impulse = 0.0;
};
c2inherit(Box2D.Dynamics.Joints.b2GearJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * this.m_impulse * this.m_J.linearB.x, inv_dt * this.m_impulse * this.m_J.linearB.y);
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    var tMat = this.m_bodyB.m_xf.R;
    var rX = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x;
    var rY = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y;
    var tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    var PX = this.m_impulse * this.m_J.linearB.x;
    var PY = this.m_impulse * this.m_J.linearB.y;
    return inv_dt * (this.m_impulse * this.m_J.angularB - rX * PY + rY * PX);
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetRatio = function() {
    return this.m_ratio;
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SetRatio = function(ratio) {
    if (ratio === undefined) ratio = 0;
    this.m_ratio = ratio;
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.InitVelocityConstraints = function(step) {
    var g1 = this.m_ground1;
    var g2 = this.m_ground2;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var ugX = 0;
    var ugY = 0;
    var rX = 0;
    var rY = 0;
    var tMat;
    var tVec;
    var crug = 0;
    var tX = 0;
    var K = 0.0;
    this.m_J.SetZero();
    if (this.m_revolute1) {
        this.m_J.angularA = (-1.0);
        K += bA.m_invI;
    } else {
        tMat = g1.m_xf.R;
        tVec = this.m_prismatic1.m_localXAxis1;
        ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tMat = bA.m_xf.R;
        rX = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        rY = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = tMat.col1.x * rX + tMat.col2.x * rY;
        rY = tMat.col1.y * rX + tMat.col2.y * rY;
        rX = tX;
        crug = rX * ugY - rY * ugX;
        this.m_J.linearA.Set((-ugX), (-ugY));
        this.m_J.angularA = (-crug);
        K += bA.m_invMass + bA.m_invI * crug * crug;
    }
    if (this.m_revolute2) {
        this.m_J.angularB = (-this.m_ratio);
        K += this.m_ratio * this.m_ratio * bB.m_invI;
    } else {
        tMat = g2.m_xf.R;
        tVec = this.m_prismatic2.m_localXAxis1;
        ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tMat = bB.m_xf.R;
        rX = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        rY = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = tMat.col1.x * rX + tMat.col2.x * rY;
        rY = tMat.col1.y * rX + tMat.col2.y * rY;
        rX = tX;
        crug = rX * ugY - rY * ugX;
        this.m_J.linearB.Set((-this.m_ratio * ugX), (-this.m_ratio * ugY));
        this.m_J.angularB = (-this.m_ratio * crug);
        K += this.m_ratio * this.m_ratio * (bB.m_invMass + bB.m_invI * crug * crug);
    }
    this.m_mass = K > 0.0 ? 1.0 / K : 0.0;
    if (step.warmStarting) {
        bA.m_linearVelocity.x += bA.m_invMass * this.m_impulse * this.m_J.linearA.x;
        bA.m_linearVelocity.y += bA.m_invMass * this.m_impulse * this.m_J.linearA.y;
        bA.m_angularVelocity += bA.m_invI * this.m_impulse * this.m_J.angularA;
        bB.m_linearVelocity.x += bB.m_invMass * this.m_impulse * this.m_J.linearB.x;
        bB.m_linearVelocity.y += bB.m_invMass * this.m_impulse * this.m_J.linearB.y;
        bB.m_angularVelocity += bB.m_invI * this.m_impulse * this.m_J.angularB;
    } else {
        this.m_impulse = 0.0;
    }
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SolveVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var Cdot = this.m_J.Compute(bA.m_linearVelocity, bA.m_angularVelocity, bB.m_linearVelocity, bB.m_angularVelocity);
    var impulse = (-this.m_mass * Cdot);
    this.m_impulse += impulse;
    bA.m_linearVelocity.x += bA.m_invMass * impulse * this.m_J.linearA.x;
    bA.m_linearVelocity.y += bA.m_invMass * impulse * this.m_J.linearA.y;
    bA.m_angularVelocity += bA.m_invI * impulse * this.m_J.angularA;
    bB.m_linearVelocity.x += bB.m_invMass * impulse * this.m_J.linearB.x;
    bB.m_linearVelocity.y += bB.m_invMass * impulse * this.m_J.linearB.y;
    bB.m_angularVelocity += bB.m_invI * impulse * this.m_J.angularB;
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var linearError = 0.0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var coordinate1 = 0;
    var coordinate2 = 0;
    if (this.m_revolute1) {
        coordinate1 = this.m_revolute1.GetJointAngle();
    } else {
        coordinate1 = this.m_prismatic1.GetJointTranslation();
    }
    if (this.m_revolute2) {
        coordinate2 = this.m_revolute2.GetJointAngle();
    } else {
        coordinate2 = this.m_prismatic2.GetJointTranslation();
    }
    var C = this.m_constant - (coordinate1 + this.m_ratio * coordinate2);
    var impulse = (-this.m_mass * C);
    bA.m_sweep.c.x += bA.m_invMass * impulse * this.m_J.linearA.x;
    bA.m_sweep.c.y += bA.m_invMass * impulse * this.m_J.linearA.y;
    bA.m_sweep.a += bA.m_invI * impulse * this.m_J.angularA;
    bB.m_sweep.c.x += bB.m_invMass * impulse * this.m_J.linearB.x;
    bB.m_sweep.c.y += bB.m_invMass * impulse * this.m_J.linearB.y;
    bB.m_sweep.a += bB.m_invI * impulse * this.m_J.angularB;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return linearError < Box2D.Common.b2Settings.b2_linearSlop;
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2JointDef}
 */
 Box2D.Dynamics.Joints.b2GearJointDef = function() {
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_gearJoint;
    this.joint1 = null;
    this.joint2 = null;
    this.ratio = 1.0;
};
c2inherit(Box2D.Dynamics.Joints.b2GearJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2GearJointDef.prototype.Initialize = function(joint1, joint2, ratio) {
    this.joint1 = joint1;
    this.bodyA = joint1.GetBodyA();
    this.joint2 = joint2;
    this.bodyB = joint2.GetBodyA();
    this.ratio = ratio;
};
Box2D.Dynamics.Joints.b2GearJointDef.prototype.Create = function() {
    return new Box2D.Dynamics.Joints.b2GearJoint(this);
};
/**
 * @constructor
 */
Box2D.Dynamics.Joints.b2Jacobian = function() {
    this.linearA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearB = Box2D.Common.Math.b2Vec2.Get(0, 0);
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.SetZero = function() {
    this.linearA.SetZero();
    this.angularA = 0.0;
    this.linearB.SetZero();
    this.angularB = 0.0;
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.Set = function(x1, a1, x2, a2) {
    if (a1 === undefined) a1 = 0;
    if (a2 === undefined) a2 = 0;
    this.linearA.SetV(x1);
    this.angularA = a1;
    this.linearB.SetV(x2);
    this.angularB = a2;
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.Compute = function(x1, a1, x2, a2) {
    if (a1 === undefined) a1 = 0;
    if (a2 === undefined) a2 = 0;
    return (this.linearA.x * x1.x + this.linearA.y * x1.y) + this.angularA * a1 + (this.linearB.x * x2.x + this.linearB.y * x2.y) + this.angularB * a2;
};
/**
 * @param {!Box2D.Dynamics.Joints.b2LineJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2LineJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localXAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localYAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_perp = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_K = new Box2D.Common.Math.b2Mat22();
    this.m_impulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    var tMat;
    var tX = 0;
    var tY = 0;
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_localXAxis1.SetV(def.localAxisA);
    this.m_localYAxis1.x = (-this.m_localXAxis1.y);
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_impulse.SetZero();
    this.m_motorMass = 0.0;
    this.m_motorImpulse = 0.0;
    this.m_lowerTranslation = def.lowerTranslation;
    this.m_upperTranslation = def.upperTranslation;
    this.m_maxMotorForce = def.maxMotorForce;
    this.m_motorSpeed = def.motorSpeed;
    this.m_enableLimit = def.enableLimit;
    this.m_enableMotor = def.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero();
};
c2inherit(Box2D.Dynamics.Joints.b2LineJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y));
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return inv_dt * this.m_impulse.y;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetJointTranslation = function() {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var p1 = bA.GetWorldPoint(this.m_localAnchor1);
    var p2 = bB.GetWorldPoint(this.m_localAnchor2);
    var dX = p2.x - p1.x;
    var dY = p2.y - p1.y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var translation = axis.x * dX + axis.y * dY;
    return translation;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetJointSpeed = function() {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var p1X = bA.m_sweep.c.x + r1X;
    var p1Y = bA.m_sweep.c.y + r1Y;
    var p2X = bB.m_sweep.c.x + r2X;
    var p2Y = bB.m_sweep.c.y + r2Y;
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var v1 = bA.m_linearVelocity;
    var v2 = bB.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var w2 = bB.m_angularVelocity;
    var speed = (dX * ((-w1 * axis.y)) + dY * (w1 * axis.x)) + (axis.x * (((v2.x + ((-w2 * r2Y))) - v1.x) - ((-w1 * r1Y))) + axis.y * (((v2.y + (w2 * r2X)) - v1.y) - (w1 * r1X)));
    return speed;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.IsLimitEnabled = function() {
    return this.m_enableLimit;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.EnableLimit = function(flag) {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableLimit = flag;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetLowerLimit = function() {
    return this.m_lowerTranslation;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetUpperLimit = function() {
    return this.m_upperTranslation;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetLimits = function(lower, upper) {
    if (lower === undefined) lower = 0;
    if (upper === undefined) upper = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_lowerTranslation = lower;
    this.m_upperTranslation = upper;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.IsMotorEnabled = function() {
    return this.m_enableMotor;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.EnableMotor = function(flag) {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableMotor = flag;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetMotorSpeed = function(speed) {
    if (speed === undefined) speed = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_motorSpeed = speed;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMotorSpeed = function() {
    return this.m_motorSpeed;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetMaxMotorForce = function(force) {
    if (force === undefined) force = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_maxMotorForce = force;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMaxMotorForce = function() {
    return this.m_maxMotorForce;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMotorForce = function() {
    return this.m_motorImpulse;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.InitVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX = 0;
    this.m_localCenterA.SetV(bA.GetLocalCenter());
    this.m_localCenterB.SetV(bB.GetLocalCenter());
    var xf1 = bA.GetTransform();
    var xf2 = bB.GetTransform();
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    this.m_invMassA = bA.m_invMass;
    this.m_invMassB = bB.m_invMass;
    this.m_invIA = bA.m_invI;
    this.m_invIB = bB.m_invI;
    this.m_axis.SetV(Box2D.Common.Math.b2Math.MulMV(xf1.R, this.m_localXAxis1));
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1.0 / this.m_motorMass : 0.0;
    this.m_perp.SetV(Box2D.Common.Math.b2Math.MulMV(xf1.R, this.m_localYAxis1));
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var m1 = this.m_invMassA;
    var m2 = this.m_invMassB;
    var i1 = this.m_invIA;
    var i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    if (this.m_enableLimit) {
        var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * Box2D.Common.b2Settings.b2_linearSlop) {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits;
        } else if (jointTransition <= this.m_lowerTranslation) {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
                this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit;
                this.m_impulse.y = 0.0;
            }
        } else if (jointTransition >= this.m_upperTranslation) {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
                this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
                this.m_impulse.y = 0.0;
            }
        } else {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
            this.m_impulse.y = 0.0;
        }
    } else {
        this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    }
    if (this.m_enableMotor == false) {
        this.m_motorImpulse = 0.0;
    }
    if (step.warmStarting) {
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x;
        var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y;
        var L1 = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1;
        var L2 = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
        bA.m_linearVelocity.x -= this.m_invMassA * PX;
        bA.m_linearVelocity.y -= this.m_invMassA * PY;
        bA.m_angularVelocity -= this.m_invIA * L1;
        bB.m_linearVelocity.x += this.m_invMassB * PX;
        bB.m_linearVelocity.y += this.m_invMassB * PY;
        bB.m_angularVelocity += this.m_invIB * L2;
    } else {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0.0;
    }
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SolveVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var v1 = bA.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var v2 = bB.m_linearVelocity;
    var w2 = bB.m_angularVelocity;
    var PX = 0;
    var PY = 0;
    var L1 = 0;
    var L2 = 0;
    if (this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits) {
        var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
        var oldImpulse = this.m_motorImpulse;
        var maxImpulse = step.dt * this.m_maxMotorForce;
        this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + impulse, (-maxImpulse), maxImpulse);
        impulse = this.m_motorImpulse - oldImpulse;
        PX = impulse * this.m_axis.x;
        PY = impulse * this.m_axis.y;
        L1 = impulse * this.m_a1;
        L2 = impulse * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    var Cdot1 = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit) {
        var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var f1 = this.m_impulse.Copy();
        var df = this.m_K.Solve(Box2D.Common.Math.b2Vec2.Get(0, 0), (-Cdot1), (-Cdot2));
        this.m_impulse.Add(df);
        if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
            this.m_impulse.y = Math.max(this.m_impulse.y, 0.0);
        } else if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
            this.m_impulse.y = Math.min(this.m_impulse.y, 0.0);
        }
        var b = (-Cdot1) - (this.m_impulse.y - f1.y) * this.m_K.col2.x;
        var f2r = 0;
        if (this.m_K.col1.x != 0.0) {
            f2r = b / this.m_K.col1.x + f1.x;
        } else {
            f2r = f1.x;
        }
        this.m_impulse.x = f2r;
        df.x = this.m_impulse.x - f1.x;
        df.y = this.m_impulse.y - f1.y;
        PX = df.x * this.m_perp.x + df.y * this.m_axis.x;
        PY = df.x * this.m_perp.y + df.y * this.m_axis.y;
        L1 = df.x * this.m_s1 + df.y * this.m_a1;
        L2 = df.x * this.m_s2 + df.y * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    } else {
        var df2 = 0;
        if (this.m_K.col1.x != 0.0) {
            df2 = ((-Cdot1)) / this.m_K.col1.x;
        } else {
            df2 = 0.0;
        }
        this.m_impulse.x += df2;
        PX = df2 * this.m_perp.x;
        PY = df2 * this.m_perp.y;
        L1 = df2 * this.m_s1;
        L2 = df2 * this.m_s2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    bA.m_linearVelocity.SetV(v1);
    bA.m_angularVelocity = w1;
    bB.m_linearVelocity.SetV(v2);
    bB.m_angularVelocity = w2;
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var limitC = 0;
    var oldLimitImpulse = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var c1 = bA.m_sweep.c;
    var a1 = bA.m_sweep.a;
    var c2 = bB.m_sweep.c;
    var a2 = bB.m_sweep.a;
    var tMat;
    var tX = 0;
    var m1 = 0;
    var m2 = 0;
    var i1 = 0;
    var i2 = 0;
    var linearError = 0.0;
    var angularError = 0.0;
    var active = false;
    var C2 = 0.0;
    var R1 = Box2D.Common.Math.b2Mat22.FromAngle(a1);
    var R2 = Box2D.Common.Math.b2Mat22.FromAngle(a2);
    tMat = R1;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = R2;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var dX = c2.x + r2X - c1.x - r1X;
    var dY = c2.y + r2Y - c1.y - r1Y;
    if (this.m_enableLimit) {
        this.m_axis = Box2D.Common.Math.b2Math.MulMV(R1, this.m_localXAxis1);
        this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
        this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
        var translation = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * Box2D.Common.b2Settings.b2_linearSlop) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), Box2D.Common.b2Settings.b2_maxLinearCorrection);
            linearError = Math.abs(translation);
            active = true;
        } else if (translation <= this.m_lowerTranslation) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation - this.m_lowerTranslation + Box2D.Common.b2Settings.b2_linearSlop, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), 0.0);
            linearError = this.m_lowerTranslation - translation;
            active = true;
        } else if (translation >= this.m_upperTranslation) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation - this.m_upperTranslation + Box2D.Common.b2Settings.b2_linearSlop, 0.0, Box2D.Common.b2Settings.b2_maxLinearCorrection);
            linearError = translation - this.m_upperTranslation;
            active = true;
        }
    }
    this.m_perp = Box2D.Common.Math.b2Math.MulMV(R1, this.m_localYAxis1);
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var impulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    var C1 = this.m_perp.x * dX + this.m_perp.y * dY;
    linearError = Math.max(linearError, Math.abs(C1));
    angularError = 0.0;
    if (active) {
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
        this.m_K.col2.x = this.m_K.col1.y;
        this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
        this.m_K.Solve(impulse, (-C1), (-C2));
    } else {
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        var impulse1 = 0;
        if (k11 != 0.0) {
            impulse1 = ((-C1)) / k11;
        } else {
            impulse1 = 0.0;
        }
        impulse.x = impulse1;
        impulse.y = 0.0;
    }
    var PX = impulse.x * this.m_perp.x + impulse.y * this.m_axis.x;
    var PY = impulse.x * this.m_perp.y + impulse.y * this.m_axis.y;
    var L1 = impulse.x * this.m_s1 + impulse.y * this.m_a1;
    var L2 = impulse.x * this.m_s2 + impulse.y * this.m_a2;
    c1.x -= this.m_invMassA * PX;
    c1.y -= this.m_invMassA * PY;
    a1 -= this.m_invIA * L1;
    c2.x += this.m_invMassB * PX;
    c2.y += this.m_invMassB * PY;
    a2 += this.m_invIB * L2;
    bA.m_sweep.a = a1;
    bB.m_sweep.a = a2;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return linearError <= Box2D.Common.b2Settings.b2_linearSlop && angularError <= Box2D.Common.b2Settings.b2_angularSlop;
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2JointDef}
 */
Box2D.Dynamics.Joints.b2LineJointDef = function() {
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAxisA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_lineJoint;
    this.localAxisA.Set(1.0, 0.0);
    this.enableLimit = false;
    this.lowerTranslation = 0.0;
    this.upperTranslation = 0.0;
    this.enableMotor = false;
    this.maxMotorForce = 0.0;
    this.motorSpeed = 0.0;
};
c2inherit(Box2D.Dynamics.Joints.b2LineJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2LineJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
    this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
    this.localAxisA = this.bodyA.GetLocalVector(axis);
};
Box2D.Dynamics.Joints.b2LineJointDef.prototype.Create = function() {
    return new Box2D.Dynamics.Joints.b2LineJoint(this);
};
/**
 * @param {!Box2D.Dynamics.Joints.b2PrismaticJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2PrismaticJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localXAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localYAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_perp = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_K = new Box2D.Common.Math.b2Mat33();
    this.m_impulse = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_localXAxis1.SetV(def.localAxisA);
    this.m_localYAxis1.x = (-this.m_localXAxis1.y);
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_refAngle = def.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorMass = 0.0;
    this.m_motorImpulse = 0.0;
    this.m_lowerTranslation = def.lowerTranslation;
    this.m_upperTranslation = def.upperTranslation;
    this.m_maxMotorForce = def.maxMotorForce;
    this.m_motorSpeed = def.motorSpeed;
    this.m_enableLimit = def.enableLimit;
    this.m_enableMotor = def.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero();
};
c2inherit(Box2D.Dynamics.Joints.b2PrismaticJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y));
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return inv_dt * this.m_impulse.y;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetJointTranslation = function() {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var p1 = bA.GetWorldPoint(this.m_localAnchor1);
    var p2 = bB.GetWorldPoint(this.m_localAnchor2);
    var dX = p2.x - p1.x;
    var dY = p2.y - p1.y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var translation = axis.x * dX + axis.y * dY;
    return translation;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetJointSpeed = function() {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var p1X = bA.m_sweep.c.x + r1X;
    var p1Y = bA.m_sweep.c.y + r1Y;
    var p2X = bB.m_sweep.c.x + r2X;
    var p2Y = bB.m_sweep.c.y + r2Y;
    var dX = p2X - p1X;
    var dY = p2Y - p1Y;
    var axis = bA.GetWorldVector(this.m_localXAxis1);
    var v1 = bA.m_linearVelocity;
    var v2 = bB.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var w2 = bB.m_angularVelocity;
    var speed = (dX * ((-w1 * axis.y)) + dY * (w1 * axis.x)) + (axis.x * (((v2.x + ((-w2 * r2Y))) - v1.x) - ((-w1 * r1Y))) + axis.y * (((v2.y + (w2 * r2X)) - v1.y) - (w1 * r1X)));
    return speed;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.IsLimitEnabled = function() {
    return this.m_enableLimit;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.EnableLimit = function(flag) {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableLimit = flag;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetLowerLimit = function() {
    return this.m_lowerTranslation;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetUpperLimit = function() {
    return this.m_upperTranslation;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetLimits = function(lower, upper) {
    if (lower === undefined) lower = 0;
    if (upper === undefined) upper = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_lowerTranslation = lower;
    this.m_upperTranslation = upper;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.IsMotorEnabled = function() {
    return this.m_enableMotor;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.EnableMotor = function(flag) {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableMotor = flag;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetMotorSpeed = function(speed) {
    if (speed === undefined) speed = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_motorSpeed = speed;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetMotorSpeed = function() {
    return this.m_motorSpeed;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetMaxMotorForce = function(force) {
    if (force === undefined) force = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_maxMotorForce = force;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetMotorForce = function() {
    return this.m_motorImpulse;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.InitVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX = 0;
    this.m_localCenterA.SetV(bA.GetLocalCenter());
    this.m_localCenterB.SetV(bB.GetLocalCenter());
    var xf1 = bA.GetTransform();
    var xf2 = bB.GetTransform();
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    this.m_invMassA = bA.m_invMass;
    this.m_invMassB = bB.m_invMass;
    this.m_invIA = bA.m_invI;
    this.m_invIB = bB.m_invI;
    this.m_axis.SetV(Box2D.Common.Math.b2Math.MulMV(xf1.R, this.m_localXAxis1));
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    if (this.m_motorMass > Number.MIN_VALUE) this.m_motorMass = 1.0 / this.m_motorMass;
    this.m_perp.SetV(Box2D.Common.Math.b2Math.MulMV(xf1.R, this.m_localYAxis1));
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var m1 = this.m_invMassA;
    var m2 = this.m_invMassB;
    var i1 = this.m_invIA;
    var i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
    this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i1 + i2;
    this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    if (this.m_enableLimit) {
        var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * Box2D.Common.b2Settings.b2_linearSlop) {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits;
        } else if (jointTransition <= this.m_lowerTranslation) {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
                this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit;
                this.m_impulse.z = 0.0;
            }
        } else if (jointTransition >= this.m_upperTranslation) {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
                this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
                this.m_impulse.z = 0.0;
            }
        } else {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
            this.m_impulse.z = 0.0;
        }
    } else {
        this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    }
    if (this.m_enableMotor == false) {
        this.m_motorImpulse = 0.0;
    }
    if (step.warmStarting) {
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x;
        var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y;
        var L1 = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
        var L2 = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
        bA.m_linearVelocity.x -= this.m_invMassA * PX;
        bA.m_linearVelocity.y -= this.m_invMassA * PY;
        bA.m_angularVelocity -= this.m_invIA * L1;
        bB.m_linearVelocity.x += this.m_invMassB * PX;
        bB.m_linearVelocity.y += this.m_invMassB * PY;
        bB.m_angularVelocity += this.m_invIB * L2;
    } else {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0.0;
    }
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SolveVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var v1 = bA.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var v2 = bB.m_linearVelocity;
    var w2 = bB.m_angularVelocity;
    var PX = 0;
    var PY = 0;
    var L1 = 0;
    var L2 = 0;
    if (this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits) {
        var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
        var oldImpulse = this.m_motorImpulse;
        var maxImpulse = step.dt * this.m_maxMotorForce;
        this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + impulse, (-maxImpulse), maxImpulse);
        impulse = this.m_motorImpulse - oldImpulse;
        PX = impulse * this.m_axis.x;
        PY = impulse * this.m_axis.y;
        L1 = impulse * this.m_a1;
        L2 = impulse * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    var Cdot1X = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
    var Cdot1Y = w2 - w1;
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit) {
        var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
        var f1 = this.m_impulse.Copy();
        var df = this.m_K.Solve33(new Box2D.Common.Math.b2Vec3(0, 0, 0), (-Cdot1X), (-Cdot1Y), (-Cdot2));
        this.m_impulse.Add(df);
        if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
            this.m_impulse.z = Math.max(this.m_impulse.z, 0.0);
        } else if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
            this.m_impulse.z = Math.min(this.m_impulse.z, 0.0);
        }
        var bX = (-Cdot1X) - (this.m_impulse.z - f1.z) * this.m_K.col3.x;
        var bY = (-Cdot1Y) - (this.m_impulse.z - f1.z) * this.m_K.col3.y;
        var f2r = this.m_K.Solve22(Box2D.Common.Math.b2Vec2.Get(0, 0), bX, bY);
        f2r.x += f1.x;
        f2r.y += f1.y;
        this.m_impulse.x = f2r.x;
        this.m_impulse.y = f2r.y;
        df.x = this.m_impulse.x - f1.x;
        df.y = this.m_impulse.y - f1.y;
        df.z = this.m_impulse.z - f1.z;
        PX = df.x * this.m_perp.x + df.z * this.m_axis.x;
        PY = df.x * this.m_perp.y + df.z * this.m_axis.y;
        L1 = df.x * this.m_s1 + df.y + df.z * this.m_a1;
        L2 = df.x * this.m_s2 + df.y + df.z * this.m_a2;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    } else {
        var df2 = this.m_K.Solve22(Box2D.Common.Math.b2Vec2.Get(0, 0), (-Cdot1X), (-Cdot1Y));
        this.m_impulse.x += df2.x;
        this.m_impulse.y += df2.y;
        PX = df2.x * this.m_perp.x;
        PY = df2.x * this.m_perp.y;
        L1 = df2.x * this.m_s1 + df2.y;
        L2 = df2.x * this.m_s2 + df2.y;
        v1.x -= this.m_invMassA * PX;
        v1.y -= this.m_invMassA * PY;
        w1 -= this.m_invIA * L1;
        v2.x += this.m_invMassB * PX;
        v2.y += this.m_invMassB * PY;
        w2 += this.m_invIB * L2;
    }
    bA.m_linearVelocity.SetV(v1);
    bA.m_angularVelocity = w1;
    bB.m_linearVelocity.SetV(v2);
    bB.m_angularVelocity = w2;
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var limitC = 0;
    var oldLimitImpulse = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var c1 = bA.m_sweep.c;
    var a1 = bA.m_sweep.a;
    var c2 = bB.m_sweep.c;
    var a2 = bB.m_sweep.a;
    var tMat;
    var tX = 0;
    var m1 = 0;
    var m2 = 0;
    var i1 = 0;
    var i2 = 0;
    var linearError = 0.0;
    var angularError = 0.0;
    var active = false;
    var C2 = 0.0;
    var R1 = Box2D.Common.Math.b2Mat22.FromAngle(a1);
    var R2 = Box2D.Common.Math.b2Mat22.FromAngle(a2);
    tMat = R1;
    var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
    var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = R2;
    var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
    var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var dX = c2.x + r2X - c1.x - r1X;
    var dY = c2.y + r2Y - c1.y - r1Y;
    if (this.m_enableLimit) {
        this.m_axis = Box2D.Common.Math.b2Math.MulMV(R1, this.m_localXAxis1);
        this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
        this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
        var translation = this.m_axis.x * dX + this.m_axis.y * dY;
        if (Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * Box2D.Common.b2Settings.b2_linearSlop) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), Box2D.Common.b2Settings.b2_maxLinearCorrection);
            linearError = Math.abs(translation);
            active = true;
        } else if (translation <= this.m_lowerTranslation) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation - this.m_lowerTranslation + Box2D.Common.b2Settings.b2_linearSlop, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), 0.0);
            linearError = this.m_lowerTranslation - translation;
            active = true;
        } else if (translation >= this.m_upperTranslation) {
            C2 = Box2D.Common.Math.b2Math.Clamp(translation - this.m_upperTranslation + Box2D.Common.b2Settings.b2_linearSlop, 0.0, Box2D.Common.b2Settings.b2_maxLinearCorrection);
            linearError = translation - this.m_upperTranslation;
            active = true;
        }
    }
    this.m_perp = Box2D.Common.Math.b2Math.MulMV(R1, this.m_localYAxis1);
    this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
    this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
    var impulse = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    var C1X = this.m_perp.x * dX + this.m_perp.y * dY;
    var C1Y = a2 - a1 - this.m_refAngle;
    linearError = Math.max(linearError, Math.abs(C1X));
    angularError = Math.abs(C1Y);
    if (active) {
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
        this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
        this.m_K.col2.x = this.m_K.col1.y;
        this.m_K.col2.y = i1 + i2;
        this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
        this.m_K.col3.x = this.m_K.col1.z;
        this.m_K.col3.y = this.m_K.col2.z;
        this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
        this.m_K.Solve33(impulse, (-C1X), (-C1Y), (-C2));
    } else {
        m1 = this.m_invMassA;
        m2 = this.m_invMassB;
        i1 = this.m_invIA;
        i2 = this.m_invIB;
        var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
        var k12 = i1 * this.m_s1 + i2 * this.m_s2;
        var k22 = i1 + i2;
        this.m_K.col1.Set(k11, k12, 0.0);
        this.m_K.col2.Set(k12, k22, 0.0);
        var impulse1 = this.m_K.Solve22(Box2D.Common.Math.b2Vec2.Get(0, 0), (-C1X), (-C1Y));
        impulse.x = impulse1.x;
        impulse.y = impulse1.y;
        impulse.z = 0.0;
    }
    var PX = impulse.x * this.m_perp.x + impulse.z * this.m_axis.x;
    var PY = impulse.x * this.m_perp.y + impulse.z * this.m_axis.y;
    var L1 = impulse.x * this.m_s1 + impulse.y + impulse.z * this.m_a1;
    var L2 = impulse.x * this.m_s2 + impulse.y + impulse.z * this.m_a2;
    c1.x -= this.m_invMassA * PX;
    c1.y -= this.m_invMassA * PY;
    a1 -= this.m_invIA * L1;
    c2.x += this.m_invMassB * PX;
    c2.y += this.m_invMassB * PY;
    a2 += this.m_invIB * L2;
    bA.m_sweep.a = a1;
    bB.m_sweep.a = a2;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return linearError <= Box2D.Common.b2Settings.b2_linearSlop && angularError <= Box2D.Common.b2Settings.b2_angularSlop;
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2JointDef}
 */
Box2D.Dynamics.Joints.b2PrismaticJointDef = function() {
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAxisA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_prismaticJoint;
    this.localAxisA.Set(1.0, 0.0);
    this.referenceAngle = 0.0;
    this.enableLimit = false;
    this.lowerTranslation = 0.0;
    this.upperTranslation = 0.0;
    this.enableMotor = false;
    this.maxMotorForce = 0.0;
    this.motorSpeed = 0.0;
};
c2inherit(Box2D.Dynamics.Joints.b2PrismaticJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2PrismaticJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
    this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
    this.localAxisA = this.bodyA.GetLocalVector(axis);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};
Box2D.Dynamics.Joints.b2PrismaticJointDef.prototype.Create = function() {
    return new Box2D.Dynamics.Joints.b2PrismaticJoint(this);
};
/**
 * @param {!Box2D.Dynamics.Joints.b2PulleyJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2PulleyJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_groundAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_groundAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_ground = this.m_bodyA.m_world.m_groundBody;
    this.m_groundAnchor1.x = def.groundAnchorA.x - this.m_ground.m_xf.position.x;
    this.m_groundAnchor1.y = def.groundAnchorA.y - this.m_ground.m_xf.position.y;
    this.m_groundAnchor2.x = def.groundAnchorB.x - this.m_ground.m_xf.position.x;
    this.m_groundAnchor2.y = def.groundAnchorB.y - this.m_ground.m_xf.position.y;
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_ratio = def.ratio;
    this.m_constant = def.lengthA + this.m_ratio * def.lengthB;
    this.m_maxLength1 = Math.min(def.maxLengthA, this.m_constant - this.m_ratio * Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength);
    this.m_maxLength2 = Math.min(def.maxLengthB, (this.m_constant - Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
    this.m_impulse = 0.0;
    this.m_limitImpulse1 = 0.0;
    this.m_limitImpulse2 = 0.0;
};
c2inherit(Box2D.Dynamics.Joints.b2PulleyJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * this.m_impulse * this.m_u2.x, inv_dt * this.m_impulse * this.m_u2.y);
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return 0.0;
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetGroundAnchorA = function() {
    var a = this.m_ground.m_xf.position.Copy();
    a.Add(this.m_groundAnchor1);
    return a;
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetGroundAnchorB = function() {
    var a = this.m_ground.m_xf.position.Copy();
    a.Add(this.m_groundAnchor2);
    return a;
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetLength1 = function() {
    var p = this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
    var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
    var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
    var dX = p.x - sX;
    var dY = p.y - sY;
    return Math.sqrt(dX * dX + dY * dY);
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetLength2 = function() {
    var p = this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
    var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
    var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
    var dX = p.x - sX;
    var dY = p.y - sY;
    return Math.sqrt(dX * dX + dY * dY);
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetRatio = function() {
    return this.m_ratio;
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.InitVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var p1X = bA.m_sweep.c.x + r1X;
    var p1Y = bA.m_sweep.c.y + r1Y;
    var p2X = bB.m_sweep.c.x + r2X;
    var p2Y = bB.m_sweep.c.y + r2Y;
    var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
    var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
    var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
    var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    var length1 = this.m_u1.Length();
    var length2 = this.m_u2.Length();
    if (length1 > Box2D.Common.b2Settings.b2_linearSlop) {
        this.m_u1.Multiply(1.0 / length1);
    } else {
        this.m_u1.SetZero();
    }
    if (length2 > Box2D.Common.b2Settings.b2_linearSlop) {
        this.m_u2.Multiply(1.0 / length2);
    } else {
        this.m_u2.SetZero();
    }
    var C = this.m_constant - length1 - this.m_ratio * length2;
    if (C > 0.0) {
        this.m_state = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
        this.m_impulse = 0.0;
    } else {
        this.m_state = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    }
    if (length1 < this.m_maxLength1) {
        this.m_limitState1 = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
        this.m_limitImpulse1 = 0.0;
    } else {
        this.m_limitState1 = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    }
    if (length2 < this.m_maxLength2) {
        this.m_limitState2 = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
        this.m_limitImpulse2 = 0.0;
    } else {
        this.m_limitState2 = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    }
    var cr1u1 = r1X * this.m_u1.y - r1Y * this.m_u1.x;
    var cr2u2 = r2X * this.m_u2.y - r2Y * this.m_u2.x;
    this.m_limitMass1 = bA.m_invMass + bA.m_invI * cr1u1 * cr1u1;
    this.m_limitMass2 = bB.m_invMass + bB.m_invI * cr2u2 * cr2u2;
    this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
    this.m_limitMass1 = 1.0 / this.m_limitMass1;
    this.m_limitMass2 = 1.0 / this.m_limitMass2;
    this.m_pulleyMass = 1.0 / this.m_pulleyMass;
    if (step.warmStarting) {
        this.m_impulse *= step.dtRatio;
        this.m_limitImpulse1 *= step.dtRatio;
        this.m_limitImpulse2 *= step.dtRatio;
        var P1X = ((-this.m_impulse) - this.m_limitImpulse1) * this.m_u1.x;
        var P1Y = ((-this.m_impulse) - this.m_limitImpulse1) * this.m_u1.y;
        var P2X = ((-this.m_ratio * this.m_impulse) - this.m_limitImpulse2) * this.m_u2.x;
        var P2Y = ((-this.m_ratio * this.m_impulse) - this.m_limitImpulse2) * this.m_u2.y;
        bA.m_linearVelocity.x += bA.m_invMass * P1X;
        bA.m_linearVelocity.y += bA.m_invMass * P1Y;
        bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
        bB.m_linearVelocity.x += bB.m_invMass * P2X;
        bB.m_linearVelocity.y += bB.m_invMass * P2Y;
        bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
    } else {
        this.m_impulse = 0.0;
        this.m_limitImpulse1 = 0.0;
        this.m_limitImpulse2 = 0.0;
    }
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.SolveVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    var tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var v1X = 0;
    var v1Y = 0;
    var v2X = 0;
    var v2Y = 0;
    var P1X = 0;
    var P1Y = 0;
    var P2X = 0;
    var P2Y = 0;
    var Cdot = 0;
    var impulse = 0;
    var oldImpulse = 0;
    if (this.m_state == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
        v1X = bA.m_linearVelocity.x + ((-bA.m_angularVelocity * r1Y));
        v1Y = bA.m_linearVelocity.y + (bA.m_angularVelocity * r1X);
        v2X = bB.m_linearVelocity.x + ((-bB.m_angularVelocity * r2Y));
        v2Y = bB.m_linearVelocity.y + (bB.m_angularVelocity * r2X);
        Cdot = (-(this.m_u1.x * v1X + this.m_u1.y * v1Y)) - this.m_ratio * (this.m_u2.x * v2X + this.m_u2.y * v2Y);
        impulse = this.m_pulleyMass * ((-Cdot));
        oldImpulse = this.m_impulse;
        this.m_impulse = Math.max(0.0, this.m_impulse + impulse);
        impulse = this.m_impulse - oldImpulse;
        P1X = (-impulse * this.m_u1.x);
        P1Y = (-impulse * this.m_u1.y);
        P2X = (-this.m_ratio * impulse * this.m_u2.x);
        P2Y = (-this.m_ratio * impulse * this.m_u2.y);
        bA.m_linearVelocity.x += bA.m_invMass * P1X;
        bA.m_linearVelocity.y += bA.m_invMass * P1Y;
        bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
        bB.m_linearVelocity.x += bB.m_invMass * P2X;
        bB.m_linearVelocity.y += bB.m_invMass * P2Y;
        bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
    }
    if (this.m_limitState1 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
        v1X = bA.m_linearVelocity.x + ((-bA.m_angularVelocity * r1Y));
        v1Y = bA.m_linearVelocity.y + (bA.m_angularVelocity * r1X);
        Cdot = (-(this.m_u1.x * v1X + this.m_u1.y * v1Y));
        impulse = (-this.m_limitMass1 * Cdot);
        oldImpulse = this.m_limitImpulse1;
        this.m_limitImpulse1 = Math.max(0.0, this.m_limitImpulse1 + impulse);
        impulse = this.m_limitImpulse1 - oldImpulse;
        P1X = (-impulse * this.m_u1.x);
        P1Y = (-impulse * this.m_u1.y);
        bA.m_linearVelocity.x += bA.m_invMass * P1X;
        bA.m_linearVelocity.y += bA.m_invMass * P1Y;
        bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    }
    if (this.m_limitState2 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
        v2X = bB.m_linearVelocity.x + ((-bB.m_angularVelocity * r2Y));
        v2Y = bB.m_linearVelocity.y + (bB.m_angularVelocity * r2X);
        Cdot = (-(this.m_u2.x * v2X + this.m_u2.y * v2Y));
        impulse = (-this.m_limitMass2 * Cdot);
        oldImpulse = this.m_limitImpulse2;
        this.m_limitImpulse2 = Math.max(0.0, this.m_limitImpulse2 + impulse);
        impulse = this.m_limitImpulse2 - oldImpulse;
        P2X = (-impulse * this.m_u2.x);
        P2Y = (-impulse * this.m_u2.y);
        bB.m_linearVelocity.x += bB.m_invMass * P2X;
        bB.m_linearVelocity.y += bB.m_invMass * P2Y;
        bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
    }
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
    var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
    var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
    var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
    var r1X = 0;
    var r1Y = 0;
    var r2X = 0;
    var r2Y = 0;
    var p1X = 0;
    var p1Y = 0;
    var p2X = 0;
    var p2Y = 0;
    var length1 = 0;
    var length2 = 0;
    var C = 0;
    var impulse = 0;
    var oldImpulse = 0;
    var oldLimitPositionImpulse = 0;
    var tX = 0;
    var linearError = 0.0;
    if (this.m_state == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
        tMat = bA.m_xf.R;
        r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
        r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
        r1X = tX;
        tMat = bB.m_xf.R;
        r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
        r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
        r2X = tX;
        p1X = bA.m_sweep.c.x + r1X;
        p1Y = bA.m_sweep.c.y + r1Y;
        p2X = bB.m_sweep.c.x + r2X;
        p2Y = bB.m_sweep.c.y + r2Y;
        this.m_u1.Set(p1X - s1X, p1Y - s1Y);
        this.m_u2.Set(p2X - s2X, p2Y - s2Y);
        length1 = this.m_u1.Length();
        length2 = this.m_u2.Length();
        if (length1 > Box2D.Common.b2Settings.b2_linearSlop) {
            this.m_u1.Multiply(1.0 / length1);
        } else {
            this.m_u1.SetZero();
        }
        if (length2 > Box2D.Common.b2Settings.b2_linearSlop) {
            this.m_u2.Multiply(1.0 / length2);
        } else {
            this.m_u2.SetZero();
        }
        C = this.m_constant - length1 - this.m_ratio * length2;
        linearError = Math.max(linearError, (-C));
        C = Box2D.Common.Math.b2Math.Clamp(C + Box2D.Common.b2Settings.b2_linearSlop, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), 0.0);
        impulse = (-this.m_pulleyMass * C);
        p1X = (-impulse * this.m_u1.x);
        p1Y = (-impulse * this.m_u1.y);
        p2X = (-this.m_ratio * impulse * this.m_u2.x);
        p2Y = (-this.m_ratio * impulse * this.m_u2.y);
        bA.m_sweep.c.x += bA.m_invMass * p1X;
        bA.m_sweep.c.y += bA.m_invMass * p1Y;
        bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
        bB.m_sweep.c.x += bB.m_invMass * p2X;
        bB.m_sweep.c.y += bB.m_invMass * p2Y;
        bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
        bA.SynchronizeTransform();
        bB.SynchronizeTransform();
    }
    if (this.m_limitState1 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
        tMat = bA.m_xf.R;
        r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
        r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
        r1X = tX;
        p1X = bA.m_sweep.c.x + r1X;
        p1Y = bA.m_sweep.c.y + r1Y;
        this.m_u1.Set(p1X - s1X, p1Y - s1Y);
        length1 = this.m_u1.Length();
        if (length1 > Box2D.Common.b2Settings.b2_linearSlop) {
            this.m_u1.x *= 1.0 / length1;
            this.m_u1.y *= 1.0 / length1;
        } else {
            this.m_u1.SetZero();
        }
        C = this.m_maxLength1 - length1;
        linearError = Math.max(linearError, (-C));
        C = Box2D.Common.Math.b2Math.Clamp(C + Box2D.Common.b2Settings.b2_linearSlop, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), 0.0);
        impulse = (-this.m_limitMass1 * C);
        p1X = (-impulse * this.m_u1.x);
        p1Y = (-impulse * this.m_u1.y);
        bA.m_sweep.c.x += bA.m_invMass * p1X;
        bA.m_sweep.c.y += bA.m_invMass * p1Y;
        bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
        bA.SynchronizeTransform();
    }
    if (this.m_limitState2 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
        tMat = bB.m_xf.R;
        r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
        r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
        r2X = tX;
        p2X = bB.m_sweep.c.x + r2X;
        p2Y = bB.m_sweep.c.y + r2Y;
        this.m_u2.Set(p2X - s2X, p2Y - s2Y);
        length2 = this.m_u2.Length();
        if (length2 > Box2D.Common.b2Settings.b2_linearSlop) {
            this.m_u2.x *= 1.0 / length2;
            this.m_u2.y *= 1.0 / length2;
        }
        else {
            this.m_u2.SetZero();
        }
        C = this.m_maxLength2 - length2;
        linearError = Math.max(linearError, (-C));
        C = Box2D.Common.Math.b2Math.Clamp(C + Box2D.Common.b2Settings.b2_linearSlop, (-Box2D.Common.b2Settings.b2_maxLinearCorrection), 0.0);
        impulse = (-this.m_limitMass2 * C);
        p2X = (-impulse * this.m_u2.x);
        p2Y = (-impulse * this.m_u2.y);
        bB.m_sweep.c.x += bB.m_invMass * p2X;
        bB.m_sweep.c.y += bB.m_invMass * p2Y;
        bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
        bB.SynchronizeTransform();
    }
    return linearError < Box2D.Common.b2Settings.b2_linearSlop;
};
Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength = 1.0;
/**
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2JointDef}
 */
Box2D.Dynamics.Joints.b2PulleyJointDef = function() {
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.groundAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.groundAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_pulleyJoint;
    this.groundAnchorA.Set((-1.0), 1.0);
    this.groundAnchorB.Set(1.0, 1.0);
    this.localAnchorA.Set((-1.0), 0.0);
    this.localAnchorB.Set(1.0, 0.0);
    this.lengthA = 0.0;
    this.maxLengthA = 0.0;
    this.lengthB = 0.0;
    this.maxLengthB = 0.0;
    this.ratio = 1.0;
    this.collideConnected = true;
};
c2inherit(Box2D.Dynamics.Joints.b2PulleyJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2PulleyJointDef.prototype.Initialize = function(bA, bB, gaA, gaB, anchorA, anchorB, r) {
    if (r === undefined) r = 0;
    this.bodyA = bA;
    this.bodyB = bB;
    this.groundAnchorA.SetV(gaA);
    this.groundAnchorB.SetV(gaB);
    this.localAnchorA = this.bodyA.GetLocalPoint(anchorA);
    this.localAnchorB = this.bodyB.GetLocalPoint(anchorB);
    var d1X = anchorA.x - gaA.x;
    var d1Y = anchorA.y - gaA.y;
    this.lengthA = Math.sqrt(d1X * d1X + d1Y * d1Y);
    var d2X = anchorB.x - gaB.x;
    var d2Y = anchorB.y - gaB.y;
    this.lengthB = Math.sqrt(d2X * d2X + d2Y * d2Y);
    this.ratio = r;
    var C = this.lengthA + this.ratio * this.lengthB;
    this.maxLengthA = C - this.ratio * Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength;
    this.maxLengthB = (C - Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength) / this.ratio;
};
Box2D.Dynamics.Joints.b2PulleyJointDef.prototype.Create = function() {
    return new Box2D.Dynamics.Joints.b2PulleyJoint(this);
};
/**
 * @param {!Box2D.Dynamics.Joints.b2RevoluteJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2RevoluteJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.K = new Box2D.Common.Math.b2Mat22();
    this.K1 = new Box2D.Common.Math.b2Mat22();
    this.K2 = new Box2D.Common.Math.b2Mat22();
    this.K3 = new Box2D.Common.Math.b2Mat22();
    this.impulse3 = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    this.impulse2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.reduced = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat33();
    this.m_localAnchor1.SetV(def.localAnchorA);
    this.m_localAnchor2.SetV(def.localAnchorB);
    this.m_referenceAngle = def.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0.0;
    this.m_lowerAngle = def.lowerAngle;
    this.m_upperAngle = def.upperAngle;
    this.m_maxMotorTorque = def.maxMotorTorque;
    this.m_motorSpeed = def.motorSpeed;
    this.m_enableLimit = def.enableLimit;
    this.m_enableMotor = def.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
};
c2inherit(Box2D.Dynamics.Joints.b2RevoluteJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetReactionForce = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetReactionTorque = function(inv_dt) {
    if (inv_dt === undefined) inv_dt = 0;
    return inv_dt * this.m_impulse.z;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetJointAngle = function() {
    return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetJointSpeed = function() {
    return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.IsLimitEnabled = function() {
    return this.m_enableLimit;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.EnableLimit = function(flag) {
    this.m_enableLimit = flag;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetLowerLimit = function() {
    return this.m_lowerAngle;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetUpperLimit = function() {
    return this.m_upperAngle;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetLimits = function(lower, upper) {
    if (lower === undefined) lower = 0;
    if (upper === undefined) upper = 0;
    this.m_lowerAngle = lower;
    this.m_upperAngle = upper;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.IsMotorEnabled = function() {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    return this.m_enableMotor;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.EnableMotor = function(flag) {
    this.m_enableMotor = flag;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetMotorSpeed = function(speed) {
    if (speed === undefined) speed = 0;
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_motorSpeed = speed;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetMotorSpeed = function() {
    return this.m_motorSpeed;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetMaxMotorTorque = function(torque) {
    if (torque === undefined) torque = 0;
    this.m_maxMotorTorque = torque;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetMotorTorque = function() {
    return this.m_maxMotorTorque;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.InitVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX = 0;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var m1 = bA.m_invMass;
    var m2 = bB.m_invMass;
    var i1 = bA.m_invI;
    var i2 = bB.m_invI;
    this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
    this.m_mass.col2.x = (-r1Y * r1X * i1) - r2Y * r2X * i2;
    this.m_mass.col3.x = (-r1Y * i1) - r2Y * i2;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
    this.m_mass.col3.y = r1X * i1 + r2X * i2;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = i1 + i2;
    this.m_motorMass = 1.0 / (i1 + i2);
    if (!this.m_enableMotor) {
        this.m_motorImpulse = 0.0;
    }
    if (this.m_enableLimit) {
        var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
        if (Math.abs(this.m_upperAngle - this.m_lowerAngle) < 2.0 * Box2D.Common.b2Settings.b2_angularSlop) {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits;
        } else if (jointAngle <= this.m_lowerAngle) {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
                this.m_impulse.z = 0.0;
            }
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit;
        } else if (jointAngle >= this.m_upperAngle) {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
                this.m_impulse.z = 0.0;
            }
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
        } else {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
            this.m_impulse.z = 0.0;
        }
    } else {
        this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    }
    if (step.warmStarting) {
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x;
        var PY = this.m_impulse.y;
        bA.m_linearVelocity.x -= m1 * PX;
        bA.m_linearVelocity.y -= m1 * PY;
        bA.m_angularVelocity -= i1 * ((r1X * PY - r1Y * PX) + this.m_motorImpulse + this.m_impulse.z);
        bB.m_linearVelocity.x += m2 * PX;
        bB.m_linearVelocity.y += m2 * PY;
        bB.m_angularVelocity += i2 * ((r2X * PY - r2Y * PX) + this.m_motorImpulse + this.m_impulse.z);
    } else {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0.0;
    }
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SolveVelocityConstraints = function(step) {
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX = 0;
    var newImpulse = 0;
    var r1X = 0;
    var r1Y = 0;
    var r2X = 0;
    var r2Y = 0;
    var v1 = bA.m_linearVelocity;
    var w1 = bA.m_angularVelocity;
    var v2 = bB.m_linearVelocity;
    var w2 = bB.m_angularVelocity;
    var m1 = bA.m_invMass;
    var m2 = bB.m_invMass;
    var i1 = bA.m_invI;
    var i2 = bB.m_invI;
    if (this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits) {
        var Cdot = w2 - w1 - this.m_motorSpeed;
        var impulse = this.m_motorMass * ((-Cdot));
        var oldImpulse = this.m_motorImpulse;
        var maxImpulse = step.dt * this.m_maxMotorTorque;
        this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + impulse, (-maxImpulse), maxImpulse);
        impulse = this.m_motorImpulse - oldImpulse;
        w1 -= i1 * impulse;
        w2 += i2 * impulse;
    }
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit) {
        tMat = bA.m_xf.R;
        r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
        r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
        r1X = tX;
        tMat = bB.m_xf.R;
        r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
        r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
        r2X = tX;
        var Cdot1X = v2.x + ((-w2 * r2Y)) - v1.x - ((-w1 * r1Y));
        var Cdot1Y = v2.y + (w2 * r2X) - v1.y - (w1 * r1X);
        var Cdot2 = w2 - w1;
        this.m_mass.Solve33(this.impulse3, (-Cdot1X), (-Cdot1Y), (-Cdot2));
        if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_equalLimits) {
            this.m_impulse.Add(this.impulse3);
        } else if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
            newImpulse = this.m_impulse.z + this.impulse3.z;
            if (newImpulse < 0.0) {
                this.m_mass.Solve22(this.reduced, (-Cdot1X), (-Cdot1Y));
                this.impulse3.x = this.reduced.x;
                this.impulse3.y = this.reduced.y;
                this.impulse3.z = (-this.m_impulse.z);
                this.m_impulse.x += this.reduced.x;
                this.m_impulse.y += this.reduced.y;
                this.m_impulse.z = 0.0;
            }
        } else if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
            newImpulse = this.m_impulse.z + this.impulse3.z;
            if (newImpulse > 0.0) {
                this.m_mass.Solve22(this.reduced, (-Cdot1X), (-Cdot1Y));
                this.impulse3.x = this.reduced.x;
                this.impulse3.y = this.reduced.y;
                this.impulse3.z = (-this.m_impulse.z);
                this.m_impulse.x += this.reduced.x;
                this.m_impulse.y += this.reduced.y;
                this.m_impulse.z = 0.0;
            }
        }
        v1.x -= m1 * this.impulse3.x;
        v1.y -= m1 * this.impulse3.y;
        w1 -= i1 * (r1X * this.impulse3.y - r1Y * this.impulse3.x + this.impulse3.z);
        v2.x += m2 * this.impulse3.x;
        v2.y += m2 * this.impulse3.y;
        w2 += i2 * (r2X * this.impulse3.y - r2Y * this.impulse3.x + this.impulse3.z);
    } else {
        tMat = bA.m_xf.R;
        r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
        r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
        tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
        r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
        r1X = tX;
        tMat = bB.m_xf.R;
        r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
        r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
        tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
        r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
        r2X = tX;
        var CdotX = v2.x + ((-w2 * r2Y)) - v1.x - ((-w1 * r1Y));
        var CdotY = v2.y + (w2 * r2X) - v1.y - (w1 * r1X);
        this.m_mass.Solve22(this.impulse2, (-CdotX), (-CdotY));
        this.m_impulse.x += this.impulse2.x;
        this.m_impulse.y += this.impulse2.y;
        v1.x -= m1 * this.impulse2.x;
        v1.y -= m1 * this.impulse2.y;
        w1 -= i1 * (r1X * this.impulse2.y - r1Y * this.impulse2.x);
        v2.x += m2 * this.impulse2.x;
        v2.y += m2 * this.impulse2.y;
        w2 += i2 * (r2X * this.impulse2.y - r2Y * this.impulse2.x);
    }
    bA.m_linearVelocity.SetV(v1);
    bA.m_angularVelocity = w1;
    bB.m_linearVelocity.SetV(v2);
    bB.m_angularVelocity = w2;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var oldLimitImpulse = 0;
    var C = 0;
    var tMat;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var angularError = 0.0;
    var positionError = 0.0;
    var tX = 0;
    var impulseX = 0;
    var impulseY = 0;
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit) {
        var angle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
        var limitImpulse = 0.0;
        if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_equalLimits) {
            C = Box2D.Common.Math.b2Math.Clamp(angle - this.m_lowerAngle, (-Box2D.Common.b2Settings.b2_maxAngularCorrection), Box2D.Common.b2Settings.b2_maxAngularCorrection);
            limitImpulse = (-this.m_motorMass * C);
            angularError = Math.abs(C);
        } else if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit) {
            C = angle - this.m_lowerAngle;
            angularError = (-C);
            C = Box2D.Common.Math.b2Math.Clamp(C + Box2D.Common.b2Settings.b2_angularSlop, (-Box2D.Common.b2Settings.b2_maxAngularCorrection), 0.0);
            limitImpulse = (-this.m_motorMass * C);
        } else if (this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit) {
            C = angle - this.m_upperAngle;
            angularError = C;
            C = Box2D.Common.Math.b2Math.Clamp(C - Box2D.Common.b2Settings.b2_angularSlop, 0.0, Box2D.Common.b2Settings.b2_maxAngularCorrection);
            limitImpulse = (-this.m_motorMass * C);
        }
        bA.m_sweep.a -= bA.m_invI * limitImpulse;
        bB.m_sweep.a += bB.m_invI * limitImpulse;
        bA.SynchronizeTransform();
        bB.SynchronizeTransform();
    }
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    var CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    var CLengthSquared = CX * CX + CY * CY;
    var CLength = Math.sqrt(CLengthSquared);
    positionError = CLength;
    var invMass1 = bA.m_invMass;
    var invMass2 = bB.m_invMass;
    var invI1 = bA.m_invI;
    var invI2 = bB.m_invI;
    var k_allowedStretch = 10.0 * Box2D.Common.b2Settings.b2_linearSlop;
    if (CLengthSquared > k_allowedStretch * k_allowedStretch) {
        var uX = CX / CLength;
        var uY = CY / CLength;
        var k = invMass1 + invMass2;
        var m = 1.0 / k;
        impulseX = m * ((-CX));
        impulseY = m * ((-CY));
        var k_beta = 0.5;
        bA.m_sweep.c.x -= k_beta * invMass1 * impulseX;
        bA.m_sweep.c.y -= k_beta * invMass1 * impulseY;
        bB.m_sweep.c.x += k_beta * invMass2 * impulseX;
        bB.m_sweep.c.y += k_beta * invMass2 * impulseY;
        CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
        CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
    }
    this.K1.col1.x = invMass1 + invMass2;
    this.K1.col2.x = 0.0;
    this.K1.col1.y = 0.0;
    this.K1.col2.y = invMass1 + invMass2;
    this.K2.col1.x = invI1 * r1Y * r1Y;
    this.K2.col2.x = (-invI1 * r1X * r1Y);
    this.K2.col1.y = (-invI1 * r1X * r1Y);
    this.K2.col2.y = invI1 * r1X * r1X;
    this.K3.col1.x = invI2 * r2Y * r2Y;
    this.K3.col2.x = (-invI2 * r2X * r2Y);
    this.K3.col1.y = (-invI2 * r2X * r2Y);
    this.K3.col2.y = invI2 * r2X * r2X;
    this.K.SetM(this.K1);
    this.K.AddM(this.K2);
    this.K.AddM(this.K3);
    this.K.Solve(Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse, (-CX), (-CY));
    impulseX = Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse.x;
    impulseY = Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse.y;
    bA.m_sweep.c.x -= bA.m_invMass * impulseX;
    bA.m_sweep.c.y -= bA.m_invMass * impulseY;
    bA.m_sweep.a -= bA.m_invI * (r1X * impulseY - r1Y * impulseX);
    bB.m_sweep.c.x += bB.m_invMass * impulseX;
    bB.m_sweep.c.y += bB.m_invMass * impulseY;
    bB.m_sweep.a += bB.m_invI * (r2X * impulseY - r2Y * impulseX);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return positionError <= Box2D.Common.b2Settings.b2_linearSlop && angularError <= Box2D.Common.b2Settings.b2_angularSlop;
};
Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
/**
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2JointDef}
 */
Box2D.Dynamics.Joints.b2RevoluteJointDef = function() {
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint;
    this.localAnchorA.SetZero();
    this.localAnchorB.SetZero();
    this.referenceAngle = 0.0;
    this.lowerAngle = 0.0;
    this.upperAngle = 0.0;
    this.maxMotorTorque = 0.0;
    this.motorSpeed = 0.0;
    this.enableLimit = false;
    this.enableMotor = false;
};
c2inherit(Box2D.Dynamics.Joints.b2RevoluteJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2RevoluteJointDef.prototype.Initialize = function(bA, bB, anchor) {
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
    this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};
Box2D.Dynamics.Joints.b2RevoluteJointDef.prototype.Create = function() {
    return new Box2D.Dynamics.Joints.b2RevoluteJoint(this);
};
/**
 * @param {!Box2D.Dynamics.Joints.b2WeldJointDef} def
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2Joint}
 */
Box2D.Dynamics.Joints.b2WeldJoint = function(def) {
    Box2D.Dynamics.Joints.b2Joint.call(this, def);
    this.m_localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat33();
    this.m_localAnchorA.SetV(def.localAnchorA);
    this.m_localAnchorB.SetV(def.localAnchorB);
    this.m_referenceAngle = def.referenceAngle;
};
c2inherit(Box2D.Dynamics.Joints.b2WeldJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetAnchorA = function() {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetAnchorB = function() {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
};
/**
 * @param {number} inv_dt
 * @return {!Box2D.Common.Math.b2Vec2}
 */
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetReactionForce = function(inv_dt) {
    return Box2D.Common.Math.b2Vec2.Get(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};
/**
 * @param {number} inv_dt
 * @return {number}
 */
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetReactionTorque = function(inv_dt) {
    return inv_dt * this.m_impulse.z;
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.InitVelocityConstraints = function(step) {
    var tMat;
    var tX = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rAX + tMat.col2.x * rAY);
    rAY = (tMat.col1.y * rAX + tMat.col2.y * rAY);
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rBX + tMat.col2.x * rBY);
    rBY = (tMat.col1.y * rBX + tMat.col2.y * rBY);
    rBX = tX;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
    this.m_mass.col2.x = (-rAY * rAX * iA) - rBY * rBX * iB;
    this.m_mass.col3.x = (-rAY * iA) - rBY * iB;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
    this.m_mass.col3.y = rAX * iA + rBX * iB;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = iA + iB;
    if (step.warmStarting) {
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_impulse.z *= step.dtRatio;
        bA.m_linearVelocity.x -= mA * this.m_impulse.x;
        bA.m_linearVelocity.y -= mA * this.m_impulse.y;
        bA.m_angularVelocity -= iA * (rAX * this.m_impulse.y - rAY * this.m_impulse.x + this.m_impulse.z);
        bB.m_linearVelocity.x += mB * this.m_impulse.x;
        bB.m_linearVelocity.y += mB * this.m_impulse.y;
        bB.m_angularVelocity += iB * (rBX * this.m_impulse.y - rBY * this.m_impulse.x + this.m_impulse.z);
    } else {
        this.m_impulse.SetZero();
    }
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.SolveVelocityConstraints = function(step) {
    var tMat;
    var tX = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var vA = bA.m_linearVelocity;
    var wA = bA.m_angularVelocity;
    var vB = bB.m_linearVelocity;
    var wB = bB.m_angularVelocity;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rAX + tMat.col2.x * rAY);
    rAY = (tMat.col1.y * rAX + tMat.col2.y * rAY);
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rBX + tMat.col2.x * rBY);
    rBY = (tMat.col1.y * rBX + tMat.col2.y * rBY);
    rBX = tX;
    var Cdot1X = vB.x - wB * rBY - vA.x + wA * rAY;
    var Cdot1Y = vB.y + wB * rBX - vA.y - wA * rAX;
    var Cdot2 = wB - wA;
    var impulse = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    this.m_mass.Solve33(impulse, (-Cdot1X), (-Cdot1Y), (-Cdot2));
    this.m_impulse.Add(impulse);
    vA.x -= mA * impulse.x;
    vA.y -= mA * impulse.y;
    wA -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
    vB.x += mB * impulse.x;
    vB.y += mB * impulse.y;
    wB += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
    bA.m_angularVelocity = wA;
    bB.m_angularVelocity = wB;
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.SolvePositionConstraints = function(baumgarte) {
    if (baumgarte === undefined) baumgarte = 0;
    var tMat;
    var tX = 0;
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    tMat = bA.m_xf.R;
    var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
    var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rAX + tMat.col2.x * rAY);
    rAY = (tMat.col1.y * rAX + tMat.col2.y * rAY);
    rAX = tX;
    tMat = bB.m_xf.R;
    var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
    var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * rBX + tMat.col2.x * rBY);
    rBY = (tMat.col1.y * rBX + tMat.col2.y * rBY);
    rBX = tX;
    var mA = bA.m_invMass;
    var mB = bB.m_invMass;
    var iA = bA.m_invI;
    var iB = bB.m_invI;
    var C1X = bB.m_sweep.c.x + rBX - bA.m_sweep.c.x - rAX;
    var C1Y = bB.m_sweep.c.y + rBY - bA.m_sweep.c.y - rAY;
    var C2 = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    var k_allowedStretch = 10.0 * Box2D.Common.b2Settings.b2_linearSlop;
    var positionError = Math.sqrt(C1X * C1X + C1Y * C1Y);
    var angularError = Math.abs(C2);
    if (positionError > k_allowedStretch) {
        iA *= 1.0;
        iB *= 1.0;
    }
    this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
    this.m_mass.col2.x = (-rAY * rAX * iA) - rBY * rBX * iB;
    this.m_mass.col3.x = (-rAY * iA) - rBY * iB;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
    this.m_mass.col3.y = rAX * iA + rBX * iB;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = iA + iB;
    var impulse = new Box2D.Common.Math.b2Vec3(0, 0, 0);
    this.m_mass.Solve33(impulse, (-C1X), (-C1Y), (-C2));
    bA.m_sweep.c.x -= mA * impulse.x;
    bA.m_sweep.c.y -= mA * impulse.y;
    bA.m_sweep.a -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
    bB.m_sweep.c.x += mB * impulse.x;
    bB.m_sweep.c.y += mB * impulse.y;
    bB.m_sweep.a += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
    return positionError <= Box2D.Common.b2Settings.b2_linearSlop && angularError <= Box2D.Common.b2Settings.b2_angularSlop;
};
/**
 * @constructor
 * @extends {Box2D.Dynamics.Joints.b2JointDef}
 */
Box2D.Dynamics.Joints.b2WeldJointDef = function() {
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_weldJoint;
    this.referenceAngle = 0.0;
};
c2inherit(Box2D.Dynamics.Joints.b2WeldJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2WeldJointDef.prototype.Initialize = function(bA, bB, anchor) {
    this.bodyA = bA;
    this.bodyB = bB;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};
Box2D.Dynamics.Joints.b2WeldJointDef.prototype.Create = function() {
    return new Box2D.Dynamics.Joints.b2WeldJoint(this);
};
Box2D.Collision.b2Collision.s_incidentEdge = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_clipPoints1 = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_clipPoints2 = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_localTangent = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_localNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_planePoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_tangent = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_tangent2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_v11 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_v12 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2TimeOfImpact.b2_toiCalls = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiRootIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = 0;
Box2D.Collision.b2TimeOfImpact.s_cache = new Box2D.Collision.b2SimplexCache();
Box2D.Collision.b2TimeOfImpact.s_distanceInput = new Box2D.Collision.b2DistanceInput();
Box2D.Collision.b2TimeOfImpact.s_xfA = new Box2D.Common.Math.b2Transform();
Box2D.Collision.b2TimeOfImpact.s_xfB = new Box2D.Common.Math.b2Transform();
Box2D.Collision.b2TimeOfImpact.s_fcn = new Box2D.Collision.b2SeparationFunction();
Box2D.Collision.b2TimeOfImpact.s_distanceOutput = new Box2D.Collision.b2DistanceOutput();
/** @type {!Box2D.Common.Math.b2Transform} */
Box2D.Dynamics.b2Body.s_xf1 = new Box2D.Common.Math.b2Transform();
Box2D.Dynamics.b2ContactListener.b2_defaultListener = new Box2D.Dynamics.b2ContactListener();
Box2D.Dynamics.b2ContactManager.s_evalCP = new Box2D.Collision.b2ContactPoint();
/** @type {!Box2D.Common.Math.b2Transform} */
Box2D.Dynamics.b2World.s_xf = new Box2D.Common.Math.b2Transform();
/** @type {!Box2D.Common.Math.b2Sweep} */
Box2D.Dynamics.b2World.s_backupA = new Box2D.Common.Math.b2Sweep();
/** @type {!Box2D.Common.Math.b2Sweep} */
Box2D.Dynamics.b2World.s_backupB = new Box2D.Common.Math.b2Sweep();
Box2D.Dynamics.Contacts.b2Contact.s_input = new Box2D.Collision.b2TOIInput();
Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold = new Box2D.Collision.b2WorldManifold();
Box2D.Dynamics.Contacts.b2ContactSolver.s_psm = new Box2D.Dynamics.Contacts.b2PositionSolverManifold();
/*
* Convex Separator for Box2D Flash
*
* This class has been written by Antoan Angelov.
* It is designed to work with Erin Catto's Box2D physics library.
*
* Everybody can use this software for any purpose, under two restrictions:
* 1. You cannot claim that you wrote this software.
* 2. You can not remove or alter this notice.
*
*/
cr.b2Separator = function() {};
cr.b2Separator.det = function(x1, y1, x2, y2, x3, y3)
{
	return x1*y2 + x2*y3 + x3*y1 - y1*x2 - y2*x3 - y3*x1;
};
cr.b2Separator.hitRay = function(x1, y1, x2, y2, x3, y3, x4, y4)
{
	var t1 = x3-x1, t2 = y3-y1, t3 = x2-x1, t4 = y2-y1, t5 = x4-x3, t6 = y4-y3, t7 = t4*t5 - t3*t6;
	var a = (t5*t2 - t6*t1) / t7;
	var px = x1 + a*t3, py = y1 + a*t4;
	var b1 = cr.b2Separator.isOnSegment(x2, y2, x1, y1, px, py);
	var b2 = cr.b2Separator.isOnSegment(px, py, x3, y3, x4, y4);
	if (b1 && b2)
		return Box2D.Common.Math.b2Vec2.Get(px, py);
	else
		return null;
};
cr.b2Separator.isOnSegment = function(px, py, x1, y1, x2, y2)
{
	var b1 = (x1+0.1 >= px && px >= x2-0.1) || (x1-0.1 <= px && px <= x2+0.1);
	var b2 = (y1+0.1 >= py && py >= y2-0.1) || (y1-0.1 <= py && py <= y2+0.1);
	return (b1 && b2) && cr.b2Separator.isOnLine(px, py, x1, y1, x2, y2);
};
cr.b2Separator.isOnLine = function(px, py, x1, y1, x2, y2)
{
	if (Math.abs(x2-x1) > 0.1)
	{
		var a = (y2-y1) / (x2-x1);
		var possibleY = a * (px-x1)+y1;
		var diff = Math.abs(possibleY-py);
		return diff < 0.1;
	}
	return Math.abs(px-x1) < 0.1;
};
cr.b2Separator.pointsMatch = function(x1, y1, x2, y2)
{
	return Math.abs(x2-x1) < 0.1 && Math.abs(y2-y1) < 0.1;
};
cr.b2Separator.Separate = function(verticesVec /*array of b2Vec2*/, objarea)
{
	var b2Vec2 = Box2D.Common.Math.b2Vec2;
	var calced = cr.b2Separator.calcShapes(verticesVec);
	var ret = [];
	var poly, a, b, c;
	var i, len, j, lenj;
	var areasum;
	for (i = 0, len = calced.length; i < len; i++)
	{
		a = calced[i];
		poly = [];
		poly.length = a.length;
		areasum = 0;
		for (j = 0, lenj = a.length; j < lenj; j++)
		{
			b = a[j];
			c = a[(j + 1) % lenj];
			areasum += (b.x * c.y - b.y * c.x);
			poly[j] = b2Vec2.Get(b.x, b.y);
		}
		areasum = Math.abs(areasum / 2);
		if (areasum >= objarea * 0.001)
			ret.push(poly);
	}
;
	return ret;
};
cr.b2Separator.calcShapes = function(verticesVec /*array of b2Vec2*/)
{
	var vec = [];										// array of b2Vec2
	var i = 0, n = 0, j = 0;							// ints
	var d = 0, t = 0, dx = 0, dy = 0, minLen = 0;		// numbers
	var i1 = 0, i2 = 0, i3 = 0;							// ints
	var p1, p2, p3, v1, v2, v, hitV;					// b2Vec2s
	var j1 = 0, j2 = 0, k = 0, h = 0;					// ints
	var vec1 = [], vec2 = [];							// array of b2Vec2
	var isConvex = false;								// boolean
	var figsVec = [], queue = [];						// Arrays
	queue.push(verticesVec);
	while (queue.length)
	{
		vec = queue[0];
		n = vec.length;
		isConvex = true;
		for (i = 0; i < n; i++)
		{
			i1 = i;
			i2 = (i < n-1) ? i+1 : i+1-n;
			i3 = (i < n-2) ? i+2 : i+2-n;
			p1 = vec[i1];
			p2 = vec[i2];
			p3 = vec[i3];
			d = cr.b2Separator.det(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
			if (d < 0)
			{
				isConvex = false;
				minLen = 1e9;
				for (j = 0; j < n; j++)
				{
					if ((j !== i1) && (j !== i2))
					{
						j1 = j;
						j2 = (j<n - 1) ? j+1 : 0;
						v1 = vec[j1];
						v2 = vec[j2];
						v = cr.b2Separator.hitRay(p1.x, p1.y, p2.x, p2.y, v1.x, v1.y, v2.x, v2.y);
						if (v)
						{
							dx = p2.x - v.x;
							dy = p2.y - v.y;
							t = dx*dx + dy*dy;
							if (t < minLen)
							{
								h = j1;
								k = j2;
								hitV = v;
								minLen = t;
							}
						}
					}
				}
				if (minLen === 1e9)
					return [];
				vec1 = [];
				vec2 = [];
				j1 = h;
				j2 = k;
				v1 = vec[j1];
				v2 = vec[j2];
				if (!cr.b2Separator.pointsMatch(hitV.x, hitV.y, v2.x, v2.y))
					vec1.push(hitV);
				if (!cr.b2Separator.pointsMatch(hitV.x, hitV.y, v1.x, v1.y))
					vec2.push(hitV);
				h = -1;
				k = i1;
				while (true)
				{
					if (k !== j2)
						vec1.push(vec[k]);
					else
					{
						if (h < 0 || h >= n)
							return [];
						if (!cr.b2Separator.isOnSegment(v2.x, v2.y, vec[h].x, vec[h].y, p1.x, p1.y))
							vec1.push(vec[k]);
						break;
					}
					h = k;
					if (k-1 < 0)
						k = n-1;
					else
						k--;
				}
				vec1.reverse();
				h = -1;
				k = i2;
				while (true)
				{
					if (k !== j1)
						vec2.push(vec[k]);
					else
					{
						if (h < 0 || h >= n)
							return [];
						if (k === j1 && !cr.b2Separator.isOnSegment(v1.x, v1.y, vec[h].x, vec[h].y, p2.x, p2.y))
							vec2.push(vec[k]);
						break;
					}
					h = k;
					if (k+1 > n-1)
						k = 0;
					else
						k++;
				}
				queue.push(vec1, vec2);
				queue.shift();
				break;
			}
		}
		if (isConvex)
			figsVec.push(queue.shift());
	}
	return figsVec;
};
;
;
cr.behaviors.Physics = function(runtime)
{
	for (var i = 0; i < 4000; i++)
		Box2D.Common.Math.b2Vec2._freeCache.push(new Box2D.Common.Math.b2Vec2(0, 0));
	this.runtime = runtime;
	this.world = new Box2D.Dynamics.b2World(
								Box2D.Common.Math.b2Vec2.Get(0, 10),	// gravity
								true);									// allow sleep
	this.worldG = 10;
	this.lastUpdateTick = -1;
	var listener = new Box2D.Dynamics.b2ContactListener;
	listener.behavior = this;
    listener.BeginContact = function(contact)
	{
        var behA = contact.m_fixtureA.GetBody().c2userdata;
		var behB = contact.m_fixtureB.GetBody().c2userdata;
		this.behavior.runtime.registerCollision(behA.inst, behB.inst);
    };
	this.world.SetContactListener(listener);
	var filter = new Box2D.Dynamics.b2ContactFilter;
	filter.behavior = this;
	filter.ShouldCollide = function (fixtureA, fixtureB)
	{
		if (this.behavior.allCollisionsEnabled)
			return true;
		var typeA = fixtureA.GetBody().c2userdata.inst.type;
		var typeB = fixtureB.GetBody().c2userdata.inst.type;
		var s = typeA.extra.Physics_DisabledCollisions;
		if (s && s.contains(typeB))
			return false;
		s = typeB.extra.Physics_DisabledCollisions;
		if (s && s.contains(typeA))
			return false;
		return true;
	};
	this.world.SetContactFilter(filter);
	this.steppingMode = 0;		// fixed
	this.velocityIterations = 8;
	this.positionIterations = 3;
	this.allCollisionsEnabled = true;
};
(function ()
{
	var b2Vec2 = Box2D.Common.Math.b2Vec2,
		b2BodyDef = Box2D.Dynamics.b2BodyDef,
		b2Body = Box2D.Dynamics.b2Body,
		b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
		b2Fixture = Box2D.Dynamics.b2Fixture,
		b2World = Box2D.Dynamics.b2World,
		b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
		b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
		b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef,
		b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef,
		b2Transform = Box2D.Common.Math.b2Transform,
		b2Mat22 = Box2D.Common.Math.b2Mat22;
	var worldScale = 0.02;
	var behaviorProto = cr.behaviors.Physics.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		this.world = this.behavior.world;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.immovable = (this.properties[0] !== 0);
		this.collisionmask = this.properties[1];
		this.preventRotation = (this.properties[2] !== 0);
		this.density = this.properties[3];
		this.friction = this.properties[4];
		this.restitution = this.properties[5];
		this.linearDamping = this.properties[6];
		this.angularDamping = this.properties[7];
		this.bullet = (this.properties[8] !== 0);
		this.body = null;
		this.inst.update_bbox();
		this.lastKnownX = this.inst.x;
		this.lastKnownY = this.inst.y;
		this.lastKnownAngle = this.inst.angle;
		this.lastWidth = 0;
		this.lastHeight = 0;
		this.lastTickOverride = false;
		this.recreateBody = false;
		this.lastAnimation = null;			// for sprites only - will be undefined for other objects
		this.lastAnimationFrame = -1;		// for sprites only - will be undefined for other objects
		if (this.myJoints)
		{
			this.myJoints.length = 0;
			this.myCreatedJoints.length = 0;
			this.joiningMe.clear();
		}
		else
		{
			this.myJoints = [];						// Created Box2D joints
			this.myCreatedJoints = [];				// List of actions called to create joints
			this.joiningMe = new cr.ObjectSet();	// Instances with joints to me
		}
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.postCreate = function ()
	{
		this.inst.update_bbox();
		this.createBody();
		this.lastAnimation = this.inst.cur_animation;
		this.lastAnimationFrame = this.inst.cur_frame;
	};
	behinstProto.onDestroy = function()
	{
		this.destroyMyJoints();
		this.myCreatedJoints.length = 0;
		this.joiningMe.clear();
		if (this.body)
		{
			this.world.DestroyBody(this.body);
			this.body = null;
		}
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.onInstanceDestroyed = function (inst)
	{
		var i, len, j;
		for (i = 0, j = 0, len = this.myCreatedJoints.length; i < len; i++)
		{
			this.myCreatedJoints[j] = this.myCreatedJoints[i];
			this.myJoints[j] = this.myJoints[i];
			if (this.myCreatedJoints[i].params[1] == inst)		// attached instance is always 2nd param
				this.world.DestroyJoint(this.myJoints[i]);
			else
				j++;
		}
		this.myCreatedJoints.length = j;
		this.myJoints.length = j;
		this.joiningMe.remove(inst);
	};
	behinstProto.destroyMyJoints = function()
	{
		var i, len;
		for (i = 0, len = this.myJoints.length; i < len; i++)
			this.world.DestroyJoint(this.myJoints[i]);
		this.myJoints.length = 0;
	};
	behinstProto.recreateMyJoints = function()
	{
		var i, len, j;
		for (i = 0, len = this.myCreatedJoints.length; i < len; i++)
		{
			j = this.myCreatedJoints[i];
			switch (j.type) {
			case 0:			// distance joint
				this.doCreateDistanceJoint(j.params[0], j.params[1], j.params[2], j.params[3], j.params[4]);
				break;
			case 1:			// revolute joint
				this.doCreateRevoluteJoint(j.params[0], j.params[1]);
				break;
			case 2:			// limited revolute joint
				this.doCreateLimitedRevoluteJoint(j.params[0], j.params[1], j.params[2], j.params[3]);
				break;
			default:
;
			}
		}
	};
	behinstProto.createBody = function()
	{
		var inst = this.inst;
		var hadOldBody = false;
		var oldVelocity = null;
		var oldOmega = null;
		var i, len, j, lenj, vec, arr, b;
		if (this.body)
		{
			hadOldBody = true;
			oldVelocity = b2Vec2.Get(0, 0);
			oldVelocity.SetV(this.body.GetLinearVelocity());
			oldOmega = this.body.GetAngularVelocity();
			this.destroyMyJoints();
			this.world.DestroyBody(this.body);
			this.body = null;
		}
		var fixDef = new b2FixtureDef;
		fixDef.density = this.density;
		fixDef.friction = this.friction;
		fixDef.restitution = this.restitution;
		var bodyDef = new b2BodyDef;
		if (this.immovable)
			bodyDef.type = b2BodyDef.b2_staticBody;
		else
			bodyDef.type = b2BodyDef.b2_dynamicBody;
		inst.update_bbox();
		bodyDef.position.x = inst.bquad.midX() * worldScale;
		bodyDef.position.y = inst.bquad.midY() * worldScale;
		bodyDef.angle = inst.angle;
		bodyDef.fixedRotation = this.preventRotation;
		bodyDef.linearDamping = this.linearDamping;
		bodyDef.angularDamping = this.angularDamping;
		bodyDef.bullet = this.bullet;
		var hasPoly = this.inst.collision_poly && !this.inst.collision_poly.is_empty();
		this.body = this.world.CreateBody(bodyDef);
		this.body.c2userdata = this;
		var usecollisionmask = this.collisionmask;
		if (!hasPoly && this.collisionmask === 0)
			usecollisionmask = 1;
		var instw = Math.max(Math.abs(inst.width), 1);
		var insth = Math.max(Math.abs(inst.height), 1);
		var ismirrored = inst.width < 0;
		var isflipped = inst.height < 0;
		if (usecollisionmask === 0)
		{
			var oldAngle = inst.angle;
			inst.angle = 0;
			inst.set_bbox_changed();
			inst.update_bbox();
			var offx = inst.bquad.midX() - inst.x;
			var offy = inst.bquad.midY() - inst.y;
			inst.angle = oldAngle;
			inst.set_bbox_changed();
			inst.collision_poly.cache_poly(ismirrored ? -instw : instw, isflipped ? -insth : insth, 0);
			var pts_cache = inst.collision_poly.pts_cache;
			var pts_count = inst.collision_poly.pts_count;
			arr = [];
			arr.length = pts_count;
			for (i = 0; i < pts_count; i++)
			{
				arr[i] = b2Vec2.Get(pts_cache[i*2] - offx, pts_cache[i*2+1] - offy);
			}
			if (ismirrored !== isflipped)
				arr.reverse();		// wrong clockwise order when flipped
			var convexpolys = cr.b2Separator.Separate(arr, instw * insth);
			for (i = 0; i < pts_count; i++)
				b2Vec2.Free(arr[i]);
			if (convexpolys.length)
			{
				for (i = 0, len = convexpolys.length; i < len; i++)
				{
					arr = convexpolys[i];
;
					for (j = 0, lenj = arr.length; j < lenj; j++)
					{
						vec = arr[j];
						vec.x *= worldScale;
						vec.y *= worldScale;
					}
					fixDef.shape = new b2PolygonShape;
					fixDef.shape.SetAsArray(arr, arr.length);		// copies content of arr
					this.body.CreateFixture(fixDef);
					for (j = 0, lenj = arr.length; j < lenj; j++)
						b2Vec2.Free(arr[j]);
				}
			}
			else
			{
				fixDef.shape = new b2PolygonShape;
				fixDef.shape.SetAsBox(instw * worldScale * 0.5, insth * worldScale * 0.5);
				this.body.CreateFixture(fixDef);
			}
		}
		else if (usecollisionmask === 1)
		{
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox(instw * worldScale * 0.5, insth * worldScale * 0.5);
			this.body.CreateFixture(fixDef);
		}
		else
		{
			fixDef.shape = new b2CircleShape(Math.min(instw, insth) * worldScale * 0.5);
			this.body.CreateFixture(fixDef);
		}
		inst.extra.box2dbody = this.body;
		this.lastWidth = inst.width;
		this.lastHeight = inst.height;
		if (hadOldBody)
		{
			this.body.SetLinearVelocity(oldVelocity);
			this.body.SetAngularVelocity(oldOmega);
			b2Vec2.Free(oldVelocity);
			this.recreateMyJoints();
			arr = this.joiningMe.valuesRef();
			for (i = 0, len = arr.length; i < len; i++)
			{
				b = arr[i].extra.box2dbody.c2userdata;
				b.destroyMyJoints();
				b.recreateMyJoints();
			}
		}
	};
	/*
	behinstProto.draw = function (ctx)
	{
		if (!this.myconvexpolys)
			return;
		this.inst.update_bbox();
		var midx = this.inst.bquad.midX();
		var midy = this.inst.bquad.midY();
		var i, len, j, lenj;
		var sina = 0;
		var cosa = 1;
		if (this.inst.angle !== 0)
		{
			sina = Math.sin(this.inst.angle);
			cosa = Math.cos(this.inst.angle);
		}
		var strokeStyles = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"];
		ctx.lineWidth = 2;
		var i, len, j, lenj, ax, ay, bx, by, poly, va, vb;
		for (i = 0, len = this.myconvexpolys.length; i < len; i++)
		{
			poly = this.myconvexpolys[i];
			ctx.strokeStyle = strokeStyles[i];
			for (j = 0, lenj = poly.length; j < lenj; j++)
			{
				va = poly[j];
				vb = poly[(j + 1) % lenj];
				ax = va.x / worldScale;
				ay = va.y / worldScale;
				bx = vb.x / worldScale;
				by = vb.y / worldScale;
				ctx.beginPath();
				ctx.moveTo(((ax * cosa) - (ay * sina)) + midx, ((ay * cosa) + (ax * sina)) + midy);
				ctx.lineTo(((bx * cosa) - (by * sina)) + midx, ((by * cosa) + (bx * sina)) + midy);
				ctx.stroke();
				ctx.closePath();
			}
		}
	};
	*/
	behinstProto.tick = function ()
	{
		var inst = this.inst;
		var dt;
		if (this.behavior.steppingMode === 0)		// fixed
			dt = this.runtime.timescale / 60;
		else
			dt = this.runtime.getDt(this.inst);
		if (this.runtime.tickcount > this.behavior.lastUpdateTick && this.runtime.timescale > 0)
		{
			this.world.Step(dt, this.behavior.velocityIterations, this.behavior.positionIterations);		// still apply timescale
			this.world.ClearForces();
			this.behavior.lastUpdateTick = this.runtime.tickcount;
		}
		if (this.recreateBody || inst.width !== this.lastWidth || inst.height !== this.lastHeight
			|| inst.cur_animation !== this.lastAnimation || inst.cur_frame !== this.lastAnimationFrame)
		{
			this.createBody();
			this.recreateBody = false;
			this.lastAnimation = inst.cur_animation;
			this.lastAnimationFrame = inst.cur_frame;
		}
		var pos_changed = (inst.x !== this.lastKnownX || inst.y !== this.lastKnownY);
		var angle_changed = (inst.angle !== this.lastKnownAngle);
		if (pos_changed)
		{
			inst.update_bbox();
			var newmidx = inst.bquad.midX();
			var newmidy = inst.bquad.midY();
			var diffx = newmidx - this.lastKnownX;
			var diffy = newmidy - this.lastKnownY;
			this.body.SetPosition(b2Vec2.Get(newmidx * worldScale, newmidy * worldScale));
			this.body.SetLinearVelocity(b2Vec2.Get(diffx, diffy));
			this.lastTickOverride = true;
			this.body.SetAwake(true);
		}
		else if (this.lastTickOverride)
		{
			this.lastTickOverride = false;
			this.body.SetLinearVelocity(b2Vec2.Get(0, 0));
			this.body.SetPosition(b2Vec2.Get(inst.bquad.midX() * worldScale, inst.bquad.midY() * worldScale));
		}
		if (angle_changed)
		{
			this.body.SetAngle(inst.angle);
			this.body.SetAwake(true);
		}
		var pos = this.body.GetPosition();
		var newx = pos.x / worldScale;
		var newy = pos.y / worldScale;
		var newangle = this.body.GetAngle();
		if (newx !== inst.x || newy !== inst.y || newangle !== inst.angle)
		{
			inst.x = newx;
			inst.y = newy;
			inst.angle = newangle;
			inst.set_bbox_changed();
			inst.update_bbox();
			var dx = inst.bquad.midX() - inst.x;
			var dy = inst.bquad.midY() - inst.y;
			if (dx !== 0 || dy !== 0)
			{
				inst.x -= dx;
				inst.y -= dy;
				inst.set_bbox_changed();
			}
		}
		this.lastKnownX = inst.x;
		this.lastKnownY = inst.y;
		this.lastKnownAngle = inst.angle;
	};
	behinstProto.getInstImgPointX = function(imgpt)
	{
		if (imgpt === -1 || !this.inst.getImagePoint)
			return this.inst.x;
		if (imgpt === 0)
			return (this.body.GetPosition().x + this.body.GetLocalCenter().x) / worldScale;
		return this.inst.getImagePoint(imgpt, true);
	};
	behinstProto.getInstImgPointY = function(imgpt)
	{
		if (imgpt === -1 || !this.inst.getImagePoint)
			return this.inst.y;
		if (imgpt === 0)
			return (this.body.GetPosition().y + this.body.GetLocalCenter().y) / worldScale;
		return this.inst.getImagePoint(imgpt, false);
	};
	function Cnds() {};
	Cnds.prototype.IsSleeping = function ()
	{
		return !this.body.IsAwake();
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.ApplyForce = function (fx, fy, imgpt)
	{
		var x = this.getInstImgPointX(imgpt);
		var y = this.getInstImgPointY(imgpt);
		this.body.ApplyForce(b2Vec2.Get(fx, fy), b2Vec2.Get(x * worldScale, y * worldScale));
	};
	Acts.prototype.ApplyForceToward = function (f, px, py, imgpt)
	{
		var x = this.getInstImgPointX(imgpt);
		var y = this.getInstImgPointY(imgpt);
		var a = cr.angleTo(x, y, px, py);
		this.body.ApplyForce(b2Vec2.Get(Math.cos(a) * f, Math.sin(a) * f), b2Vec2.Get(x * worldScale, y * worldScale));
	};
	Acts.prototype.ApplyForceAtAngle = function (f, a, imgpt)
	{
		a = cr.to_radians(a);
		var x = this.getInstImgPointX(imgpt);
		var y = this.getInstImgPointY(imgpt);
		this.body.ApplyForce(b2Vec2.Get(Math.cos(a) * f, Math.sin(a) * f), b2Vec2.Get(x * worldScale, y * worldScale));
	};
	Acts.prototype.ApplyImpulse = function (fx, fy, imgpt)
	{
		var x = this.getInstImgPointX(imgpt);
		var y = this.getInstImgPointY(imgpt);
		this.body.ApplyImpulse(b2Vec2.Get(fx, fy), b2Vec2.Get(x * worldScale, y * worldScale));
		this.lastTickOverride = false;
		this.lastKnownX = this.inst.x;
		this.lastKnownY = this.inst.y;
	};
	Acts.prototype.ApplyImpulseToward = function (f, px, py, imgpt)
	{
		var x = this.getInstImgPointX(imgpt);
		var y = this.getInstImgPointY(imgpt);
		var a = cr.angleTo(x, y, px, py);
		this.body.ApplyImpulse(b2Vec2.Get(Math.cos(a) * f, Math.sin(a) * f), b2Vec2.Get(x * worldScale, y * worldScale));
		this.lastTickOverride = false;
		this.lastKnownX = this.inst.x;
		this.lastKnownY = this.inst.y;
	};
	Acts.prototype.ApplyImpulseAtAngle = function (f, a, imgpt)
	{
		a = cr.to_radians(a);
		var x = this.getInstImgPointX(imgpt);
		var y = this.getInstImgPointY(imgpt);
		this.body.ApplyImpulse(b2Vec2.Get(Math.cos(a) * f, Math.sin(a) * f), b2Vec2.Get(x * worldScale, y * worldScale));
		this.lastTickOverride = false;
		this.lastKnownX = this.inst.x;
		this.lastKnownY = this.inst.y;
	};
	Acts.prototype.ApplyTorque = function (m)
	{
		this.body.ApplyTorque(cr.to_radians(m));
	};
	Acts.prototype.ApplyTorqueToAngle = function (m, a)
	{
		m = cr.to_radians(m);
		a = cr.to_radians(a);
		if (cr.angleClockwise(this.inst.angle, a))
			this.body.ApplyTorque(-m);
		else
			this.body.ApplyTorque(m);
	};
	Acts.prototype.ApplyTorqueToPosition = function (m, x, y)
	{
		m = cr.to_radians(m);
		var a = cr.angleTo(this.inst.x, this.inst.y, x, y);
		if (cr.angleClockwise(this.inst.angle, a))
			this.body.ApplyTorque(-m);
		else
			this.body.ApplyTorque(m);
	};
	Acts.prototype.SetAngularVelocity = function (v)
	{
		this.body.SetAngularVelocity(cr.to_radians(v));
		this.body.SetAwake(true);
	};
	Acts.prototype.CreateDistanceJoint = function (imgpt, obj, objimgpt, damping, freq)
	{
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked();
		if (!otherinst)
			return;
		if (!otherinst.extra.box2dbody)
			return;		// no physics behavior on other object
		otherinst.extra.box2dbody.c2userdata.joiningMe.add(this.inst);
		this.myCreatedJoints.push({type: 0, params: [imgpt, otherinst, objimgpt, damping, freq]});
		this.doCreateDistanceJoint(imgpt, otherinst, objimgpt, damping, freq);
	};
	behinstProto.doCreateDistanceJoint = function (imgpt, otherinst, objimgpt, damping, freq)
	{
		var myx = this.getInstImgPointX(imgpt);
		var myy = this.getInstImgPointY(imgpt);
		var theirx, theiry;
		if (otherinst.getImagePoint)
		{
			theirx = otherinst.getImagePoint(objimgpt, true);
			theiry = otherinst.getImagePoint(objimgpt, false);
		}
		else
		{
			theirx = otherinst.x;
			theiry = otherinst.y;
		}
		var dx = myx - theirx;
		var dy = myy - theiry;
		var jointDef = new b2DistanceJointDef();
		jointDef.Initialize(this.body, otherinst.extra.box2dbody, b2Vec2.Get(myx * worldScale, myy * worldScale), b2Vec2.Get(theirx * worldScale, theiry * worldScale));
		jointDef.length = Math.sqrt(dx*dx + dy*dy) * worldScale;
		jointDef.dampingRatio = damping;
		jointDef.frequencyHz = freq;
		this.myJoints.push(this.world.CreateJoint(jointDef));
	};
	Acts.prototype.CreateRevoluteJoint = function (imgpt, obj)
	{
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked();
		if (!otherinst)
			return;
		if (!otherinst.extra.box2dbody)
			return;		// no physics behavior on other object
		otherinst.extra.box2dbody.c2userdata.joiningMe.add(this.inst);
		this.myCreatedJoints.push({type: 1, params: [imgpt, otherinst]});
		this.doCreateRevoluteJoint(imgpt, otherinst);
	};
	behinstProto.doCreateRevoluteJoint = function (imgpt, otherinst)
	{
		var myx = this.getInstImgPointX(imgpt);
		var myy = this.getInstImgPointY(imgpt);
		var jointDef = new b2RevoluteJointDef();
		jointDef.Initialize(this.body, otherinst.extra.box2dbody, b2Vec2.Get(myx * worldScale, myy * worldScale));
		this.myJoints.push(this.world.CreateJoint(jointDef));
	};
	Acts.prototype.CreateLimitedRevoluteJoint = function (imgpt, obj, lower, upper)
	{
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked();
		if (!otherinst)
			return;
		if (!otherinst.extra.box2dbody)
			return;		// no physics behavior on other object
		otherinst.extra.box2dbody.c2userdata.joiningMe.add(this.inst);
		this.myCreatedJoints.push({type: 2, params: [imgpt, otherinst, lower, upper]});
		this.doCreateLimitedRevoluteJoint(imgpt, otherinst, lower, upper);
	};
	behinstProto.doCreateLimitedRevoluteJoint = function (imgpt, otherinst, lower, upper)
	{
		var myx = this.getInstImgPointX(imgpt);
		var myy = this.getInstImgPointY(imgpt);
		var jointDef = new b2RevoluteJointDef();
		jointDef.Initialize(this.body, otherinst.extra.box2dbody, b2Vec2.Get(myx * worldScale, myy * worldScale));
		jointDef.enableLimit = true;
		jointDef.lowerAngle = cr.to_radians(lower);
		jointDef.upperAngle = cr.to_radians(upper);
		this.myJoints.push(this.world.CreateJoint(jointDef));
	};
	Acts.prototype.SetWorldGravity = function (g)
	{
		if (g === this.behavior.worldG)
			return;
		this.world.SetGravity(b2Vec2.Get(0, g));
		this.behavior.worldG = g;
		var i, len, arr = this.behavior.my_instances.valuesRef();
		for (i = 0, len = arr.length; i < len; i++)
		{
			arr[i].extra.box2dbody.SetAwake(true);
		}
	};
	Acts.prototype.SetSteppingMode = function (mode)
	{
		this.behavior.steppingMode = mode;
	};
	Acts.prototype.SetIterations = function (vel, pos)
	{
		if (vel < 1) vel = 1;
		if (pos < 1) pos = 1;
		this.behavior.velocityIterations = vel;
		this.behavior.positionIterations = pos;
	};
	Acts.prototype.SetVelocity = function (vx, vy)
	{
		this.body.SetLinearVelocity(b2Vec2.Get(vx * worldScale, vy * worldScale));
		this.body.SetAwake(true);
		this.lastTickOverride = false;
		this.lastKnownX = this.inst.x;
		this.lastKnownY = this.inst.y;
	};
	Acts.prototype.SetDensity = function (d)
	{
		if (this.density === d)
			return;
		this.density = d;
		this.recreateBody = true;
	};
	Acts.prototype.SetFriction = function (f)
	{
		if (this.friction === f)
			return;
		this.friction = f;
		this.recreateBody = true;
	};
	Acts.prototype.SetElasticity = function (e)
	{
		if (this.restitution === e)
			return;
		this.restitution = e;
		this.recreateBody = true;
	};
	Acts.prototype.SetLinearDamping = function (ld)
	{
		if (this.linearDamping === ld)
			return;
		this.linearDamping = ld;
		this.body.SetLinearDamping(ld);
	};
	Acts.prototype.SetAngularDamping = function (ad)
	{
		if (this.angularDamping === ad)
			return;
		this.angularDamping = ad;
		this.body.SetAngularDamping(ad);
	};
	Acts.prototype.SetImmovable = function (i)
	{
		if (this.immovable === (i !== 0))
			return;
		this.immovable = (i !== 0);
		this.body.SetType(this.immovable ? b2BodyDef.b2_staticBody : b2BodyDef.b2_dynamicBody);
		this.body.SetAwake(true);
	};
	function SetCollisionsEnabled(typeA, typeB, state)
	{
		var s;
		if (state)
		{
			s = typeA.extra.Physics_DisabledCollisions;
			if (s)
				s.remove(typeB);
			s = typeB.extra.Physics_DisabledCollisions;
			if (s)
				s.remove(typeA);
		}
		else
		{
			if (!typeA.extra.Physics_DisabledCollisions)
				typeA.extra.Physics_DisabledCollisions = new cr.ObjectSet();
			typeA.extra.Physics_DisabledCollisions.add(typeB);
			if (!typeB.extra.Physics_DisabledCollisions)
				typeB.extra.Physics_DisabledCollisions = new cr.ObjectSet();
			typeB.extra.Physics_DisabledCollisions.add(typeA);
		}
	};
	Acts.prototype.EnableCollisions = function (obj, state)
	{
		if (!obj)
			return;
		var i, len;
		if (obj.is_family)
		{
			for (i = 0, len = obj.members.length; i < len; i++)
			{
				SetCollisionsEnabled(this.inst.type, obj.members[i], state !== 0);
			}
		}
		else
		{
			SetCollisionsEnabled(this.inst.type, obj, state !== 0);
		}
		this.behavior.allCollisionsEnabled = false;
	};
	Acts.prototype.SetPreventRotate = function (i)
	{
		if (this.preventRotation === (i !== 0))
			return;
		this.preventRotation = (i !== 0);
		this.body.SetFixedRotation(this.preventRotation);
		this.body.m_torque = 0;
		this.body.SetAngularVelocity(0);
		this.body.SetAwake(true);
	};
	Acts.prototype.SetBullet = function (i)
	{
		if (this.bullet === (i !== 0))
			return;
		this.bullet = (i !== 0);
		this.body.SetBullet(this.bullet);
		this.body.SetAwake(true);
	};
	Acts.prototype.RemoveJoints = function ()
	{
		this.destroyMyJoints();
		this.myCreatedJoints.length = 0;
		this.joiningMe.clear();
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.VelocityX = function (ret)
	{
		ret.set_float(this.body.GetLinearVelocity().x / worldScale);
	};
	Exps.prototype.VelocityY = function (ret)
	{
		ret.set_float(this.body.GetLinearVelocity().y / worldScale);
	};
	Exps.prototype.AngularVelocity = function (ret)
	{
		ret.set_float(cr.to_degrees(this.body.GetAngularVelocity()));
	};
	Exps.prototype.Mass = function (ret)
	{
		ret.set_float(this.body.GetMass() / worldScale);
	};
	Exps.prototype.CenterOfMassX = function (ret)
	{
		ret.set_float((this.body.GetPosition().x + this.body.GetLocalCenter().x) / worldScale);
	};
	Exps.prototype.CenterOfMassY = function (ret)
	{
		ret.set_float((this.body.GetPosition().y + this.body.GetLocalCenter().y) / worldScale);
	};
	Exps.prototype.Density = function (ret)
	{
		ret.set_float(this.density);
	};
	Exps.prototype.Friction = function (ret)
	{
		ret.set_float(this.friction);
	};
	Exps.prototype.Elasticity = function (ret)
	{
		ret.set_float(this.restitution);
	};
	Exps.prototype.LinearDamping = function (ret)
	{
		ret.set_float(this.linearDamping);
	};
	Exps.prototype.AngularDamping = function (ret)
	{
		ret.set_float(this.angularDamping);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Pin = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Pin.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.pinObject = null;
		this.pinAngle = 0;
		this.pinDist = 0;
		this.myStartAngle = 0;
		this.theirStartAngle = 0;
		this.lastKnownAngle = 0;
		this.mode = 0;				// 0 = position & angle; 1 = position; 2 = angle; 3 = rope; 4 = bar
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.onInstanceDestroyed = function (inst)
	{
		if (this.pinObject == inst)
			this.pinObject = null;
	};
	behinstProto.onDestroy = function()
	{
		this.pinObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.tick = function ()
	{
	};
	behinstProto.tick2 = function ()
	{
		if (!this.pinObject)
			return;
		if (this.lastKnownAngle !== this.inst.angle)
			this.myStartAngle = cr.clamp_angle(this.myStartAngle + (this.inst.angle - this.lastKnownAngle));
		var newx = this.inst.x;
		var newy = this.inst.y;
		if (this.mode === 3 || this.mode === 4)		// rope mode or bar mode
		{
			var dist = cr.distanceTo(this.inst.x, this.inst.y, this.pinObject.x, this.pinObject.y);
			if ((dist > this.pinDist) || (this.mode === 4 && dist < this.pinDist))
			{
				var a = cr.angleTo(this.pinObject.x, this.pinObject.y, this.inst.x, this.inst.y);
				newx = this.pinObject.x + Math.cos(a) * this.pinDist;
				newy = this.pinObject.y + Math.sin(a) * this.pinDist;
			}
		}
		else
		{
			newx = this.pinObject.x + Math.cos(this.pinObject.angle + this.pinAngle) * this.pinDist;
			newy = this.pinObject.y + Math.sin(this.pinObject.angle + this.pinAngle) * this.pinDist;
		}
		var newangle = cr.clamp_angle(this.myStartAngle + (this.pinObject.angle - this.theirStartAngle));
		this.lastKnownAngle = newangle;
		if ((this.mode === 0 || this.mode === 1 || this.mode === 3 || this.mode === 4)
			&& (this.inst.x !== newx || this.inst.y !== newy))
		{
			this.inst.x = newx;
			this.inst.y = newy;
			this.inst.set_bbox_changed();
		}
		if ((this.mode === 0 || this.mode === 2) && (this.inst.angle !== newangle))
		{
			this.inst.angle = newangle;
			this.inst.set_bbox_changed();
		}
	};
	function Cnds() {};
	Cnds.prototype.IsPinned = function ()
	{
		return !!this.pinObject;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Pin = function (obj, mode_)
	{
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked();
		if (!otherinst)
			return;
		this.pinObject = otherinst;
		this.pinAngle = cr.angleTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y) - otherinst.angle;
		this.pinDist = cr.distanceTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y);
		this.myStartAngle = this.inst.angle;
		this.lastKnownAngle = this.inst.angle;
		this.theirStartAngle = otherinst.angle;
		this.mode = mode_;
	};
	Acts.prototype.Unpin = function ()
	{
		this.pinObject = null;
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.PinnedUID = function (ret)
	{
		ret.set_int(this.pinObject ? this.pinObject.uid : -1);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Platform = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.Platform.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	var ANIMMODE_STOPPED = 0;
	var ANIMMODE_MOVING = 1;
	var ANIMMODE_JUMPING = 2;
	var ANIMMODE_FALLING = 3;
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		this.leftkey = false;
		this.rightkey = false;
		this.jumpkey = false;
		this.jumped = false;			// prevent bunnyhopping
		this.ignoreInput = false;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		this.lastFloorObject = null;
		this.lastFloorX = 0;
		this.lastFloorY = 0;
		this.animMode = ANIMMODE_STOPPED;
		this.enabled = true;
		this.fallthrough = 0;			// fall through jump-thru.  >0 to disable, lasts a few ticks
		this.firstTick = true;
		this.dx = 0;
		this.dy = 0;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.updateGravity = function()
	{
		this.downx = Math.cos(this.ga);
		this.downy = Math.sin(this.ga);
		this.rightx = Math.cos(this.ga - Math.PI / 2);
		this.righty = Math.sin(this.ga - Math.PI / 2);
		this.downx = cr.round6dp(this.downx);
		this.downy = cr.round6dp(this.downy);
		this.rightx = cr.round6dp(this.rightx);
		this.righty = cr.round6dp(this.righty);
		this.g1 = this.g;
		if (this.g < 0)
		{
			this.downx *= -1;
			this.downy *= -1;
			this.g = Math.abs(this.g);
		}
	};
	behinstProto.onCreate = function()
	{
		this.maxspeed = this.properties[0];
		this.acc = this.properties[1];
		this.dec = this.properties[2];
		this.jumpStrength = this.properties[3];
		this.g = this.properties[4];
		this.g1 = this.g;
		this.maxFall = this.properties[5];
		this.defaultControls = (this.properties[6] === 1);	// 0=no, 1=yes
		this.wasOnFloor = false;
		this.ga = cr.to_radians(90);
		this.updateGravity();
		if (this.defaultControls && !this.runtime.isDomFree)
		{
			jQuery(document).keydown(
				(function (self) {
					return function(info) {
						self.onKeyDown(info);
					};
				})(this)
			);
			jQuery(document).keyup(
				(function (self) {
					return function(info) {
						self.onKeyUp(info);
					};
				})(this)
			);
		}
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.onInstanceDestroyed = function (inst)
	{
		if (this.lastFloorObject == inst)
			this.lastFloorObject = null;
	};
	behinstProto.onDestroy = function ()
	{
		this.lastFloorObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.onKeyDown = function (info)
	{
		switch (info.which) {
		case 38:	// up
			info.preventDefault();
			this.jumpkey = true;
			break;
		case 37:	// left
			info.preventDefault();
			this.leftkey = true;
			break;
		case 39:	// right
			info.preventDefault();
			this.rightkey = true;
			break;
		}
	};
	behinstProto.onKeyUp = function (info)
	{
		switch (info.which) {
		case 38:	// up
			info.preventDefault();
			this.jumpkey = false;
			this.jumped = false;
			break;
		case 37:	// left
			info.preventDefault();
			this.leftkey = false;
			break;
		case 39:	// right
			info.preventDefault();
			this.rightkey = false;
			break;
		}
	};
	behinstProto.getGDir = function ()
	{
		if (this.g < 0)
			return -1;
		else
			return 1;
	};
	behinstProto.isOnFloor = function ()
	{
		var ret = null;
		var ret2 = null;
		var i, len, j;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		if (this.lastFloorObject && this.runtime.testOverlap(this.inst, this.lastFloorObject))
		{
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			return this.lastFloorObject;
		}
		else
		{
			ret = this.runtime.testOverlapSolid(this.inst);
			if (!ret && this.fallthrough === 0)
				ret2 = this.runtime.testOverlapJumpThru(this.inst, true);
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			if (ret)		// was overlapping solid
			{
				if (this.runtime.testOverlap(this.inst, ret))
					return null;
				else
					return ret;
			}
			if (ret2 && ret2.length)
			{
				for (i = 0, j = 0, len = ret2.length; i < len; i++)
				{
					ret2[j] = ret2[i];
					if (!this.runtime.testOverlap(this.inst, ret2[i]))
						j++;
				}
				if (j >= 1)
					return ret2[0];
			}
			return null;
		}
	};
	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		var mx, my, obstacle, mag, allover, i, len, j, oldx, oldy;
		if (!this.jumpkey && !this.simjump)
			this.jumped = false;
		var left = this.leftkey || this.simleft;
		var right = this.rightkey || this.simright;
		var jump = (this.jumpkey || this.simjump) && !this.jumped;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		if (!this.enabled)
			return;
		if (this.ignoreInput)
		{
			left = false;
			right = false;
			jump = false;
		}
		var lastFloor = this.lastFloorObject;
		var floor_moved = false;
		if (this.firstTick)
		{
			if (this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst))
			{
				this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, 4, true);
			}
			this.firstTick = false;
		}
		if (lastFloor && this.dy === 0 && (lastFloor.y !== this.lastFloorY || lastFloor.x !== this.lastFloorX))
		{
			mx = (lastFloor.x - this.lastFloorX);
			my = (lastFloor.y - this.lastFloorY);
			this.inst.x += mx;
			this.inst.y += my;
			this.inst.set_bbox_changed();
			this.lastFloorX = lastFloor.x;
			this.lastFloorY = lastFloor.y;
			floor_moved = true;
			if (this.runtime.testOverlapSolid(this.inst))
			{
				this.runtime.pushOutSolid(this.inst, -mx, -my, Math.sqrt(mx * mx + my * my) * 2.5);
			}
		}
		var floor_ = this.isOnFloor();
		var collobj = this.runtime.testOverlapSolid(this.inst);
		if (collobj)
		{
			if (this.runtime.pushOutSolidNearest(this.inst, Math.max(this.inst.width, this.inst.height) / 2))
				this.runtime.registerCollision(this.inst, collobj);
			else
				return;
		}
		if (floor_)
		{
			if (this.dy > 0)
			{
				if (!this.wasOnFloor)
				{
					this.runtime.pushInFractional(this.inst, -this.downx, -this.downy, floor_, 16);
					this.wasOnFloor = true;
				}
				this.dy = 0;
			}
			if (lastFloor != floor_)
			{
				this.lastFloorObject = floor_;
				this.lastFloorX = floor_.x;
				this.lastFloorY = floor_.y;
				this.runtime.registerCollision(this.inst, floor_);
			}
			else if (floor_moved)
			{
				collobj = this.runtime.testOverlapSolid(this.inst);
				if (collobj)
				{
					this.runtime.registerCollision(this.inst, collobj);
					if (mx !== 0)
					{
						if (mx > 0)
							this.runtime.pushOutSolid(this.inst, -this.rightx, -this.righty);
						else
							this.runtime.pushOutSolid(this.inst, this.rightx, this.righty);
					}
					this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy);
				}
			}
			if (jump)
			{
				oldx = this.inst.x;
				oldy = this.inst.y;
				this.inst.x -= this.downx;
				this.inst.y -= this.downy;
				this.inst.set_bbox_changed();
				if (!this.runtime.testOverlapSolid(this.inst))
				{
					this.dy = -this.jumpStrength;
					this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnJump, this.inst);
					this.animMode = ANIMMODE_JUMPING;
					this.jumped = true;
				}
				else
					jump = false;
				this.inst.x = oldx;
				this.inst.y = oldy;
				this.inst.set_bbox_changed();
			}
		}
		else
		{
			this.lastFloorObject = null;
			this.dy += this.g * dt;
			if (this.dy > this.maxFall)
				this.dy = this.maxFall;
			if (jump)
				this.jumped = true;
		}
		this.wasOnFloor = !!floor_;
		if (left == right)	// both up or both down
		{
			if (this.dx < 0)
			{
				this.dx += this.dec * dt;
				if (this.dx > 0)
					this.dx = 0;
			}
			else if (this.dx > 0)
			{
				this.dx -= this.dec * dt;
				if (this.dx < 0)
					this.dx = 0;
			}
		}
		if (left && !right)
		{
			if (this.dx > 0)
				this.dx -= (this.acc + this.dec) * dt;
			else
				this.dx -= this.acc * dt;
		}
		if (right && !left)
		{
			if (this.dx < 0)
				this.dx += (this.acc + this.dec) * dt;
			else
				this.dx += this.acc * dt;
		}
		if (this.dx > this.maxspeed)
			this.dx = this.maxspeed;
		else if (this.dx < -this.maxspeed)
			this.dx = -this.maxspeed;
		if (this.dx !== 0)
		{
			oldx = this.inst.x;
			oldy = this.inst.y;
			mx = this.dx * dt * this.rightx;
			my = this.dx * dt * this.righty;
			this.inst.x += this.rightx * (this.dx > 1 ? 1 : -1) - this.downx;
			this.inst.y += this.righty * (this.dx > 1 ? 1 : -1) - this.downy;
			this.inst.set_bbox_changed();
			var is_jumpthru = false;
			var slope_too_steep = this.runtime.testOverlapSolid(this.inst);
			/*
			if (!slope_too_steep && floor_)
			{
				slope_too_steep = this.runtime.testOverlapJumpThru(this.inst);
				is_jumpthru = true;
				if (slope_too_steep)
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					if (this.runtime.testOverlap(this.inst, slope_too_steep))
					{
						slope_too_steep = null;
						is_jumpthru = false;
					}
				}
			}
			*/
			this.inst.x = oldx + mx;
			this.inst.y = oldy + my;
			this.inst.set_bbox_changed();
			obstacle = this.runtime.testOverlapSolid(this.inst);
			if (!obstacle && floor_)
			{
				obstacle = this.runtime.testOverlapJumpThru(this.inst);
				if (obstacle)
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					if (this.runtime.testOverlap(this.inst, obstacle))
					{
						obstacle = null;
						is_jumpthru = false;
					}
					else
						is_jumpthru = true;
					this.inst.x = oldx + mx;
					this.inst.y = oldy + my;
					this.inst.set_bbox_changed();
				}
			}
			if (obstacle)
			{
				var push_dist = Math.abs(this.dx * dt) + 2;
				if (slope_too_steep || !this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, push_dist, is_jumpthru, obstacle))
				{
					this.runtime.registerCollision(this.inst, obstacle);
					push_dist = Math.max(Math.abs(this.dx * dt * 2.5), 30);
					if (!this.runtime.pushOutSolid(this.inst, this.rightx * (this.dx < 0 ? 1 : -1), this.righty * (this.dx < 0 ? 1 : -1), push_dist, false))
					{
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed();
					}
					if (!is_jumpthru)
						this.dx = 0;	// stop
				}
			}
			else
			{
				var newfloor = this.isOnFloor();
				if (floor_ && !newfloor)
				{
					mag = Math.ceil(Math.abs(this.dx * dt)) + 2;
					oldx = this.inst.x;
					oldy = this.inst.y;
					this.inst.x += this.downx * mag;
					this.inst.y += this.downy * mag;
					this.inst.set_bbox_changed();
					if (this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst))
						this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, mag + 2, true);
					else
					{
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed();
					}
				}
				else if (newfloor && this.dy === 0)
				{
					this.runtime.pushInFractional(this.inst, -this.downx, -this.downy, newfloor, 16);
				}
			}
		}
		var landed = false;
		if (this.dy !== 0)
		{
			oldx = this.inst.x;
			oldy = this.inst.y;
			this.inst.x += this.dy * dt * this.downx;
			this.inst.y += this.dy * dt * this.downy;
			var newx = this.inst.x;
			var newy = this.inst.y;
			this.inst.set_bbox_changed();
			collobj = this.runtime.testOverlapSolid(this.inst);
			var fell_on_jumpthru = false;
			if (!collobj && (this.dy > 0) && !floor_)
			{
				allover = this.fallthrough > 0 ? null : this.runtime.testOverlapJumpThru(this.inst, true);
				if (allover && allover.length)
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					for (i = 0, j = 0, len = allover.length; i < len; i++)
					{
						allover[j] = allover[i];
						if (!this.runtime.testOverlap(this.inst, allover[i]))
							j++;
					}
					allover.length = j;
					this.inst.x = newx;
					this.inst.y = newy;
					this.inst.set_bbox_changed();
					if (allover.length >= 1)
						collobj = allover[0];
				}
				fell_on_jumpthru = !!collobj;
			}
			if (collobj)
			{
				this.runtime.registerCollision(this.inst, collobj);
				var push_dist = Math.max(Math.abs(this.dy * dt * 2.5 + 10), 30);
				if (!this.runtime.pushOutSolid(this.inst, this.downx * (this.dy < 0 ? 1 : -1), this.downy * (this.dy < 0 ? 1 : -1), push_dist, fell_on_jumpthru, collobj))
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					this.wasOnFloor = true;		// prevent adjustment for unexpected floor landings
				}
				else
				{
					this.lastFloorObject = collobj;
					this.lastFloorX = collobj.x;
					this.lastFloorY = collobj.y;
					if (fell_on_jumpthru)
						landed = true;
				}
				this.dy = 0;	// stop
			}
		}
		if (this.animMode !== ANIMMODE_FALLING && this.dy > 0 && !floor_)
		{
			this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnFall, this.inst);
			this.animMode = ANIMMODE_FALLING;
		}
		if (floor_ || landed)
		{
			if (this.animMode === ANIMMODE_FALLING || landed || (jump && this.dy === 0))
			{
				this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnLand, this.inst);
				if (this.dx === 0 && this.dy === 0)
					this.animMode = ANIMMODE_STOPPED;
				else
					this.animMode = ANIMMODE_MOVING;
			}
			else
			{
				if (this.animMode !== ANIMMODE_STOPPED && this.dx === 0 && this.dy === 0)
				{
					this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnStop, this.inst);
					this.animMode = ANIMMODE_STOPPED;
				}
				if (this.animMode !== ANIMMODE_MOVING && (this.dx !== 0 || this.dy !== 0) && !jump)
				{
					this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnMove, this.inst);
					this.animMode = ANIMMODE_MOVING;
				}
			}
		}
		if (this.fallthrough > 0)
			this.fallthrough--;
	};
	function Cnds() {};
	Cnds.prototype.IsMoving = function ()
	{
		return this.dx !== 0 || this.dy !== 0;
	};
	Cnds.prototype.CompareSpeed = function (cmp, s)
	{
		var speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		return cr.do_cmp(speed, cmp, s);
	};
	Cnds.prototype.IsOnFloor = function ()
	{
		if (this.dy !== 0)
			return false;
		var ret = null;
		var ret2 = null;
		var i, len, j;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		ret = this.runtime.testOverlapSolid(this.inst);
		if (!ret && this.fallthrough === 0)
			ret2 = this.runtime.testOverlapJumpThru(this.inst, true);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		if (ret)		// was overlapping solid
		{
			return !this.runtime.testOverlap(this.inst, ret);
		}
		if (ret2 && ret2.length)
		{
			for (i = 0, j = 0, len = ret2.length; i < len; i++)
			{
				ret2[j] = ret2[i];
				if (!this.runtime.testOverlap(this.inst, ret2[i]))
					j++;
			}
			if (j >= 1)
				return true;
		}
		return false;
	};
	Cnds.prototype.IsByWall = function (side)
	{
		var ret = false;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x -= this.downx * 3;
		this.inst.y -= this.downy * 3;
		this.inst.set_bbox_changed();
		if (this.runtime.testOverlapSolid(this.inst))
		{
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			return false;
		}
		if (side === 0)		// left
		{
			this.inst.x -= this.rightx * 2;
			this.inst.y -= this.righty * 2;
		}
		else
		{
			this.inst.x += this.rightx * 2;
			this.inst.y += this.righty * 2;
		}
		this.inst.set_bbox_changed();
		ret = this.runtime.testOverlapSolid(this.inst);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		return ret;
	};
	Cnds.prototype.IsJumping = function ()
	{
		return this.dy < 0;
	};
	Cnds.prototype.IsFalling = function ()
	{
		return this.dy > 0;
	};
	Cnds.prototype.OnJump = function ()
	{
		return true;
	};
	Cnds.prototype.OnFall = function ()
	{
		return true;
	};
	Cnds.prototype.OnStop = function ()
	{
		return true;
	};
	Cnds.prototype.OnMove = function ()
	{
		return true;
	};
	Cnds.prototype.OnLand = function ()
	{
		return true;
	};
	behaviorProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetIgnoreInput = function (ignoring)
	{
		this.ignoreInput = ignoring;
	};
	Acts.prototype.SetMaxSpeed = function (maxspeed)
	{
		this.maxspeed = maxspeed;
		if (this.maxspeed < 0)
			this.maxspeed = 0;
	};
	Acts.prototype.SetAcceleration = function (acc)
	{
		this.acc = acc;
		if (this.acc < 0)
			this.acc = 0;
	};
	Acts.prototype.SetDeceleration = function (dec)
	{
		this.dec = dec;
		if (this.dec < 0)
			this.dec = 0;
	};
	Acts.prototype.SetJumpStrength = function (js)
	{
		this.jumpStrength = js;
		if (this.jumpStrength < 0)
			this.jumpStrength = 0;
	};
	Acts.prototype.SetGravity = function (grav)
	{
		if (this.g1 === grav)
			return;		// no change
		this.g = grav;
		this.updateGravity();
		if (this.runtime.testOverlapSolid(this.inst))
		{
			this.runtime.pushOutSolid(this.inst, this.downx, this.downy, 10);
			this.inst.x += this.downx * 2;
			this.inst.y += this.downy * 2;
			this.inst.set_bbox_changed();
		}
		this.lastFloorObject = null;
	};
	Acts.prototype.SetMaxFallSpeed = function (mfs)
	{
		this.maxFall = mfs;
		if (this.maxFall < 0)
			this.maxFall = 0;
	};
	Acts.prototype.SimulateControl = function (ctrl)
	{
		switch (ctrl) {
		case 0:		this.simleft = true;	break;
		case 1:		this.simright = true;	break;
		case 2:		this.simjump = true;	break;
		}
	};
	Acts.prototype.SetVectorX = function (vx)
	{
		this.dx = vx;
	};
	Acts.prototype.SetVectorY = function (vy)
	{
		this.dy = vy;
	};
	Acts.prototype.SetGravityAngle = function (a)
	{
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (this.ga === a)
			return;		// no change
		this.ga = a;
		this.updateGravity();
		this.lastFloorObject = null;
	};
	Acts.prototype.SetEnabled = function (en)
	{
		this.enabled = (en === 1);
	};
	Acts.prototype.FallThrough = function ()
	{
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		var overlaps = this.runtime.testOverlapJumpThru(this.inst, false);
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		if (!overlaps)
			return;
		this.fallthrough = 3;			// disable jumpthrus for 3 ticks (1 doesn't do it, 2 does, 3 to be on safe side)
		this.lastFloorObject = null;
	};
	behaviorProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(Math.sqrt(this.dx * this.dx + this.dy * this.dy));
	};
	Exps.prototype.MaxSpeed = function (ret)
	{
		ret.set_float(this.maxspeed);
	};
	Exps.prototype.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
	Exps.prototype.Deceleration = function (ret)
	{
		ret.set_float(this.dec);
	};
	Exps.prototype.JumpStrength = function (ret)
	{
		ret.set_float(this.jumpStrength);
	};
	Exps.prototype.Gravity = function (ret)
	{
		ret.set_float(this.g);
	};
	Exps.prototype.MaxFallSpeed = function (ret)
	{
		ret.set_float(this.maxFall);
	};
	Exps.prototype.MovingAngle = function (ret)
	{
		ret.set_float(cr.to_degrees(Math.atan2(this.dy, this.dx)));
	};
	Exps.prototype.VectorX = function (ret)
	{
		ret.set_float(this.dx);
	};
	Exps.prototype.VectorY = function (ret)
	{
		ret.set_float(this.dy);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.bound = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.bound.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		this.mode = 0;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
		this.mode = this.properties[0];	// 0 = origin, 1 = edge
	};
	behinstProto.tick = function ()
	{
	};
	behinstProto.tick2 = function ()
	{
		this.inst.update_bbox();
		var bbox = this.inst.bbox;
		var layout = this.inst.layer.layout;
		var changed = false;
		if (this.mode === 0)	// origin
		{
			if (this.inst.x < 0)
			{
				this.inst.x = 0;
				changed = true;
			}
			if (this.inst.y < 0)
			{
				this.inst.y = 0;
				changed = true;
			}
			if (this.inst.x > layout.width)
			{
				this.inst.x = layout.width;
				changed = true;
			}
			if (this.inst.y > layout.height)
			{
				this.inst.y = layout.height;
				changed = true;
			}
		}
		else
		{
			if (bbox.left < 0)
			{
				this.inst.x -= bbox.left;
				changed = true;
			}
			if (bbox.top < 0)
			{
				this.inst.y -= bbox.top;
				changed = true;
			}
			if (bbox.right > layout.width)
			{
				this.inst.x -= (bbox.right - layout.width);
				changed = true;
			}
			if (bbox.bottom > layout.height)
			{
				this.inst.y -= (bbox.bottom - layout.height);
				changed = true;
			}
		}
		if (changed)
			this.inst.set_bbox_changed();
	};
}());
;
;
cr.behaviors.destroy = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.destroy.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
	};
	behinstProto.tick = function ()
	{
		this.inst.update_bbox();
		var bbox = this.inst.bbox;
		var layout = this.inst.layer.layout;
		if (bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height)
			this.runtime.DestroyInstance(this.inst);
	};
}());
;
;
cr.behaviors.scrollto = function(runtime)
{
	this.runtime = runtime;
	this.shakeMag = 0;
	this.shakeStart = 0;
	this.shakeEnd = 0;
	this.shakeMode = 0;
};
(function ()
{
	var behaviorProto = cr.behaviors.scrollto.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
	};
	behinstProto.tick = function ()
	{
	};
	behinstProto.tick2 = function ()
	{
		var all = this.behavior.my_instances.values();
		var sumx = 0, sumy = 0;
		var i, len;
		for (i = 0, len = all.length; i < len; i++)
		{
			sumx += all[i].x;
			sumy += all[i].y;
		}
		var layout = this.inst.layer.layout;
		var now = this.runtime.kahanTime.sum;
		var offx = 0, offy = 0;
		if (now >= this.behavior.shakeStart && now < this.behavior.shakeEnd)
		{
			var mag = this.behavior.shakeMag * Math.min(this.runtime.timescale, 1);
			if (this.behavior.shakeMode === 0)
				mag *= 1 - (now - this.behavior.shakeStart) / (this.behavior.shakeEnd - this.behavior.shakeStart);
			var a = Math.random() * Math.PI * 2;
			var d = Math.random() * mag;
			offx = Math.cos(a) * d;
			offy = Math.sin(a) * d;
		}
		layout.scrollToX(sumx / all.length + offx);
		layout.scrollToY(sumy / all.length + offy);
	};
	function Acts() {};
	Acts.prototype.Shake = function (mag, dur, mode)
	{
		this.behavior.shakeMag = mag;
		this.behavior.shakeStart = this.runtime.kahanTime.sum;
		this.behavior.shakeEnd = this.behavior.shakeStart + dur;
		this.behavior.shakeMode = mode;
	};
	behaviorProto.acts = new Acts();
}());
;
;
cr.behaviors.solid = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.solid.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		this.inst.extra.solidEnabled = true;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
	};
	behinstProto.tick = function ()
	{
	};
	function Acts() {};
	Acts.prototype.SetEnabled = function (e)
	{
		this.inst.extra.solidEnabled = !!e;
	};
	behaviorProto.acts = new Acts();
}());
;
;
cr.behaviors.wrap = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var behaviorProto = cr.behaviors.wrap.prototype;
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function()
	{
	};
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function()
	{
	};
	behinstProto.tick = function ()
	{
		var inst = this.inst;
		inst.update_bbox();
		var bbox = inst.bbox;
		var layout = inst.layer.layout;
		if (bbox.right < 0)
		{
			inst.x = layout.width + (inst.x - bbox.left) - 1;
			inst.set_bbox_changed();
		}
		else if (bbox.left > layout.width)
		{
			inst.x = 1 - (bbox.right - inst.x);
			inst.set_bbox_changed();
		}
		else if (bbox.bottom < 0)
		{
			inst.y = layout.height + (inst.y - bbox.top) - 1;
			inst.set_bbox_changed();
		}
		else if (bbox.top > layout.height)
		{
			inst.y = 1 - (bbox.bottom - inst.y);
			inst.set_bbox_changed();
		}
	};
}());
cr.getProjectModel = function() { return [
	null,
	"Branding",
	[
	[
		cr.plugins_.Audio,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Mouse,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Keyboard,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Rex_Pause,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Sprite,
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		false
	]
,	[
		cr.plugins_.WebStorage,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Text,
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		false
	]
,	[
		cr.plugins_.Touch,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
	],
	[
	[
		"t0",
		cr.plugins_.Sprite,
		false,
		1,
		3,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/player-sheet0.png", 140, 0, 0, 32, 32, 1, 0.5, 1,[["yuckPoint", 0.40625, -0.25]],[],1]
			]
			]
		],
		[
		[
			"Platform",
			cr.behaviors.Platform
		]
,		[
			"ScrollTo",
			cr.behaviors.scrollto
		]
,		[
			"BoundToLayout",
			cr.behaviors.bound
		]
		],
		false,
		false,
		[]
	]
,	[
		"t1",
		cr.plugins_.Keyboard,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
		,[]
	]
,	[
		"t2",
		cr.plugins_.Text,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
	]
,	[
		"t3",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"PlayerIdle",
			7,
			true,
			1,
			0,
			false,
			[
				["images/playerimage-sheet0.png", 197960, 1, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerimage-sheet0.png", 197960, 98, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerimage-sheet0.png", 197960, 195, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerimage-sheet0.png", 197960, 292, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerimage-sheet0.png", 197960, 389, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerimage-sheet0.png", 197960, 1, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerimage-sheet0.png", 197960, 98, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0]
			]
			]
,			[
			"IdleToRun",
			50,
			false,
			1,
			0,
			false,
			[
				["images/playerimage-sheet1.png", 266116, 385, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 1, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 95, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 189, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 283, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 377, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 1, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 95, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
,			[
			"JumpFromRun",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerimage-sheet2.png", 270738, 95, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 188, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 281, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 374, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerimage-sheet3.png", 127447, 1, 165, 85, 163, 1, 0.447059, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 1, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 94, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 187, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0]
			]
			]
,			[
			"Run",
			20,
			true,
			1,
			0,
			true,
			[
				["images/playerimage-sheet0.png", 197960, 292, 328, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerimage-sheet0.png", 197960, 388, 328, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 1, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 373, 329, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerimage-sheet3.png", 127447, 1, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 97, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 193, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 289, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerimage-sheet3.png", 127447, 88, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerimage-sheet3.png", 127447, 175, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerimage-sheet3.png", 127447, 262, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerimage-sheet3.png", 127447, 87, 165, 85, 161, 1, 0.447059, 0.993789,[],[],0],
				["images/playerimage-sheet3.png", 127447, 349, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0]
			]
			]
,			[
			"JumpFromStand",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerimage-sheet2.png", 270738, 280, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 189, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 283, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet1.png", 266116, 377, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 1, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 95, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 189, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 283, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 377, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
,			[
			"Shoot",
			10,
			false,
			1,
			0,
			false,
			[
				["images/playerimage-sheet3.png", 127447, 436, 103, 72, 92, 1, 0.444444, 0.98913,[],[],0]
			]
			]
,			[
			"Hurt",
			75,
			false,
			1,
			0,
			false,
			[
				["images/playerimage-sheet3.png", 127447, 436, 1, 72, 101, 1, 0.444444, 0.990099,[],[],0]
			]
			]
,			[
			"Fart",
			15,
			false,
			1,
			0,
			false,
			[
				["images/playerimage-sheet0.png", 197960, 195, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerimage-sheet0.png", 197960, 1, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerimage-sheet0.png", 197960, 98, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerimage-sheet0.png", 197960, 195, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerimage-sheet0.png", 197960, 292, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerimage-sheet0.png", 197960, 389, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerimage-sheet2.png", 270738, 1, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t4",
		cr.plugins_.Mouse,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
		,[]
	]
,	[
		"t5",
		cr.plugins_.Touch,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
		,[1]
	]
,	[
		"t6",
		cr.plugins_.Rex_Pause,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
		,[]
	]
,	[
		"t7",
		cr.plugins_.Audio,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
		,[0]
	]
,	[
		"t8",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/basetle-sheet0.png", 5522, 0, 0, 402, 75, 1, 0.5, 0.506667,[],[-0.475124,-0.373334,0,-0.493333,0.475124,-0.373334,0.5,-0.0133336,0.475124,0.36,0,0.493333,-0.475124,0.36,-0.497512,-0.0133336],0]
			]
			]
		],
		[
		[
			"Solid",
			cr.behaviors.solid
		]
		],
		false,
		false,
		[]
	]
,	[
		"t9",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/layoutrightboundary-sheet0.png", 156, 0, 0, 256, 256, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t10",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/leftcontrol-sheet0.png", 2407, 0, 0, 108, 111, 1, 0.5, 0.504505,[],[-0.444444,-0.45045,0,-0.504505,0.444444,-0.45045,0.5,-0.00900951,0.435185,0.432432,0,0.468468,-0.435185,0.432432,-0.5,-0.00900951],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t11",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/rightcontrol-sheet0.png", 2416, 0, 0, 108, 111, 1, 0.509259, 0.513514,[],[-0.453704,-0.459459,-0.00925928,-0.513514,0.435185,-0.459459,0.490741,-0.0180185,0.425926,0.423423,-0.00925928,0.459459,-0.444444,0.423423,-0.509259,-0.0180185],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t12",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/upcontrol-sheet0.png", 2464, 0, 0, 108, 111, 1, 0.509259, 0.513514,[],[-0.453704,-0.459459,-0.00925928,-0.513514,0.435185,-0.459459,0.490741,-0.0180185,0.425926,0.423423,-0.00925928,0.459459,-0.444444,0.423423,-0.509259,-0.0180185],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t13",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/downcontrol-sheet0.png", 135095, 0, 0, 384, 382, 1, 0.5, 0.5,[],[-0.351562,-0.350785,0,-0.5,0.351563,-0.350785,0.497396,0,0.351563,0.350785,0,0.5,-0.351562,0.350785,-0.497396,0],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t14",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/fartcontrol-sheet0.png", 4601, 0, 0, 114, 114, 1, 0.508772, 0.508772,[],[-0.429825,-0.429825,-0.00877196,-0.482456,0.412281,-0.429825,0.464912,-0.00877196,0.412281,0.412281,-0.00877196,0.464912,-0.429825,0.412281,-0.482456,-0.00877196],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t15",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/pausecontrol-sheet0.png", 1893, 0, 0, 114, 114, 1, 0.508772, 0.508772,[],[-0.429825,-0.429825,-0.00877196,-0.482456,0.412281,-0.429825,0.464912,-0.00877196,0.412281,0.412281,-0.00877196,0.464912,-0.429825,0.412281,-0.482456,-0.00877196],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t16",
		cr.plugins_.Text,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
	]
,	[
		"t17",
		cr.plugins_.Text,
		false,
		0,
		1,
		0,
		null,
		null,
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t18",
		cr.plugins_.Text,
		false,
		0,
		1,
		0,
		null,
		null,
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t19",
		cr.plugins_.Text,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
	]
,	[
		"t20",
		cr.plugins_.Text,
		false,
		0,
		1,
		0,
		null,
		null,
		[
		[
			"Pin",
			cr.behaviors.Pin
		]
		],
		false,
		false,
		[]
	]
,	[
		"t21",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/bg-sheet0.png", 2346742, 0, 0, 1920, 1440, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t22",
		cr.plugins_.Sprite,
		false,
		0,
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/dumpster-sheet0.png", 13143, 0, 0, 181, 131, 1, 0.502762, 0.503817,[["ipTopBoundary", 0.519337, 0.0229008]],[-0.453039,-0.435114,-0.00552443,-0.496183,0.447514,-0.435114,0.441989,0.419847,-0.00552443,0.496183,-0.441989,0.412214],0]
			]
			]
		],
		[
		[
			"Physics",
			cr.behaviors.Physics
		]
,		[
			"BoundToLayout",
			cr.behaviors.bound
		]
		],
		false,
		false,
		[]
	]
,	[
		"t23",
		cr.plugins_.Sprite,
		false,
		0,
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerphysicsoverlapper-sheet0.png", 156, 0, 0, 256, 256, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		[
			"Physics",
			cr.behaviors.Physics
		]
,		[
			"Wrap",
			cr.behaviors.wrap
		]
		],
		false,
		false,
		[]
	]
,	[
		"t24",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/layoutleftboundary-sheet0.png", 156, 0, 0, 256, 256, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t25",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/dumpstertopboundary-sheet0.png", 156, 0, 0, 256, 256, 1, 0.5, 0.5,[["plusOneSpawn", 0.488281, -0.0390625]],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t26",
		cr.plugins_.Sprite,
		false,
		0,
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			true,
			1,
			0,
			false,
			[
				["images/burger-sheet1.png", 37451, 1, 84, 80, 79, 1, 0.5625, 1,[],[],0],
				["images/burger-sheet0.png", 61141, 167, 85, 82, 82, 1, 0.560976, 1,[],[],0],
				["images/burger-sheet0.png", 61141, 167, 168, 82, 82, 1, 0.560976, 1,[],[],0],
				["images/burger-sheet0.png", 61141, 1, 169, 82, 82, 1, 0.560976, 1,[],[],0],
				["images/burger-sheet1.png", 37451, 167, 1, 78, 82, 1, 0.564103, 1,[],[],0],
				["images/burger-sheet0.png", 61141, 84, 169, 82, 82, 1, 0.560976, 1,[],[],0],
				["images/burger-sheet1.png", 37451, 1, 1, 82, 82, 1, 0.560976, 1,[],[],0],
				["images/burger-sheet1.png", 37451, 82, 84, 77, 81, 1, 0.558442, 1,[],[],0]
			]
			]
,			[
			"burgerCollected",
			50,
			false,
			1,
			0,
			false,
			[
				["images/burger-sheet1.png", 37451, 84, 1, 82, 82, 1, 0.536585, 1.02439,[],[],0],
				["images/burger-sheet0.png", 61141, 1, 1, 82, 83, 1, 0.536585, 1.0241,[],[],0],
				["images/burger-sheet0.png", 61141, 84, 1, 82, 83, 1, 0.536585, 1.0241,[],[],0],
				["images/burger-sheet0.png", 61141, 167, 1, 82, 83, 1, 0.536585, 1.0241,[],[],0],
				["images/burger-sheet0.png", 61141, 1, 85, 82, 83, 1, 0.536585, 1.0241,[],[],0],
				["images/burger-sheet0.png", 61141, 84, 85, 82, 83, 1, 0.536585, 1.0241,[],[],0],
				["images/burger-sheet1.png", 37451, 160, 84, 22, 22, 1, 0.545455, 1.04545,[],[],0]
			]
			]
		],
		[
		[
			"DestroyOutsideLayout",
			cr.behaviors.destroy
		]
,		[
			"Bullet",
			cr.behaviors.Bullet
		]
		],
		false,
		false,
		[]
	]
,	[
		"t27",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/spawnpoint-sheet0.png", 169, 0, 0, 256, 256, 1, 0.5, 0.5,[],[],3]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t28",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/groundtile-sheet0.png", 5522, 0, 0, 402, 75, 1, 0.5, 0.506667,[],[-0.475124,-0.373334,0,-0.493333,0.475124,-0.373334,0.5,-0.0133336,0.475124,0.36,0,0.493333,-0.475124,0.36,-0.497512,-0.0133336],0]
			]
			]
		],
		[
		[
			"Solid",
			cr.behaviors.solid
		]
		],
		false,
		false,
		[]
	]
,	[
		"t29",
		cr.plugins_.Sprite,
		false,
		0,
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			true,
			1,
			0,
			false,
			[
				["images/pancake-sheet0.png", 68847, 1, 1, 83, 84, 1, 0.506024, 1,[],[],0],
				["images/pancake-sheet0.png", 68847, 85, 1, 83, 84, 1, 0.506024, 1,[],[],0],
				["images/pancake-sheet0.png", 68847, 169, 1, 83, 84, 1, 0.506024, 1,[],[],0],
				["images/pancake-sheet0.png", 68847, 1, 86, 83, 84, 1, 0.506024, 1,[],[],0],
				["images/pancake-sheet0.png", 68847, 85, 86, 83, 84, 1, 0.506024, 1,[],[],0],
				["images/pancake-sheet1.png", 33687, 165, 1, 79, 84, 1, 0.506329, 1,[],[],0],
				["images/pancake-sheet0.png", 68847, 169, 86, 81, 82, 1, 0.506173, 1,[],[],0],
				["images/pancake-sheet1.png", 33687, 83, 84, 78, 83, 1, 0.5, 1,[],[],0]
			]
			]
,			[
			"pancakeCollected",
			50,
			false,
			1,
			0,
			false,
			[
				["images/pancake-sheet1.png", 33687, 1, 84, 81, 81, 1, 0.518519, 0.987654,[],[],0],
				["images/pancake-sheet0.png", 68847, 169, 169, 81, 82, 1, 0.518519, 0.987805,[],[],0],
				["images/pancake-sheet0.png", 68847, 1, 171, 81, 82, 1, 0.518519, 0.987805,[],[],0],
				["images/pancake-sheet0.png", 68847, 83, 171, 81, 82, 1, 0.518519, 0.987805,[],[],0],
				["images/pancake-sheet1.png", 33687, 1, 1, 81, 82, 1, 0.518519, 0.987805,[],[],0],
				["images/pancake-sheet1.png", 33687, 83, 1, 81, 82, 1, 0.518519, 0.987805,[],[],0],
				["images/pancake-sheet1.png", 33687, 162, 86, 19, 19, 1, 0.526316, 1,[],[],0]
			]
			]
		],
		[
		[
			"Bullet",
			cr.behaviors.Bullet
		]
,		[
			"DestroyOutsideLayout",
			cr.behaviors.destroy
		]
		],
		false,
		false,
		[]
	]
,	[
		"t30",
		cr.plugins_.Sprite,
		false,
		0,
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			true,
			1,
			0,
			false,
			[
				["images/pizza-sheet1.png", 30730, 1, 1, 89, 80, 1, 0.505618, 0.9625,[],[],0],
				["images/pizza-sheet2.png", 15641, 91, 1, 86, 79, 1, 0.5, 0.962025,[],[],0],
				["images/pizza-sheet0.png", 53740, 1, 167, 90, 81, 1, 0.5, 0.962963,[],[],0],
				["images/pizza-sheet0.png", 53740, 1, 1, 90, 82, 1, 0.5, 0.963415,[],[],0],
				["images/pizza-sheet0.png", 53740, 92, 1, 90, 82, 1, 0.5, 0.963415,[],[],0],
				["images/pizza-sheet0.png", 53740, 1, 84, 90, 82, 1, 0.5, 0.963415,[],[],0],
				["images/pizza-sheet0.png", 53740, 92, 84, 90, 82, 1, 0.5, 0.963415,[],[],0],
				["images/pizza-sheet0.png", 53740, 92, 167, 87, 83, 1, 0.505747, 0.963855,[],[],0]
			]
			]
,			[
			"pizzaCollected",
			50,
			false,
			1,
			0,
			false,
			[
				["images/pizza-sheet1.png", 30730, 91, 1, 89, 80, 1, 0.494382, 1,[],[],0],
				["images/pizza-sheet2.png", 15641, 1, 1, 89, 79, 1, 0.494382, 1,[],[],0],
				["images/pizza-sheet1.png", 30730, 1, 82, 89, 80, 1, 0.494382, 1,[],[],0],
				["images/pizza-sheet1.png", 30730, 91, 82, 89, 80, 1, 0.494382, 1,[],[],0],
				["images/pizza-sheet1.png", 30730, 1, 163, 89, 80, 1, 0.494382, 1,[],[],0],
				["images/pizza-sheet1.png", 30730, 91, 163, 89, 80, 1, 0.494382, 1,[],[],0],
				["images/pizza-sheet0.png", 53740, 183, 1, 15, 13, 1, 0.466667, 1,[],[],0]
			]
			]
		],
		[
		[
			"Bullet",
			cr.behaviors.Bullet
		]
,		[
			"DestroyOutsideLayout",
			cr.behaviors.destroy
		]
		],
		false,
		false,
		[]
	]
,	[
		"t31",
		cr.plugins_.Sprite,
		false,
		0,
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			true,
			1,
			0,
			false,
			[
				["images/carrot-sheet1.png", 13462, 82, 1, 75, 84, 1, 0.48, 0.988095,[],[],0],
				["images/carrot-sheet0.png", 45872, 1, 1, 83, 88, 1, 0.481928, 0.988636,[],[],0],
				["images/carrot-sheet0.png", 45872, 85, 1, 83, 88, 1, 0.481928, 0.988636,[],[],0],
				["images/carrot-sheet0.png", 45872, 169, 1, 83, 88, 1, 0.481928, 0.988636,[],[],0],
				["images/carrot-sheet0.png", 45872, 1, 90, 83, 88, 1, 0.481928, 0.988636,[],[],0],
				["images/carrot-sheet0.png", 45872, 85, 90, 83, 88, 1, 0.481928, 0.988636,[],[],0],
				["images/carrot-sheet1.png", 13462, 1, 1, 80, 87, 1, 0.4875, 0.988506,[],[],0],
				["images/carrot-sheet0.png", 45872, 169, 90, 78, 90, 1, 0.487179, 0.988889,[],[],0]
			]
			]
		],
		[
		[
			"Bullet",
			cr.behaviors.Bullet
		]
,		[
			"DestroyOutsideLayout",
			cr.behaviors.destroy
		]
		],
		false,
		false,
		[]
	]
,	[
		"t32",
		cr.plugins_.Sprite,
		false,
		0,
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			true,
			1,
			0,
			false,
			[
				["images/pepper-sheet0.png", 58223, 89, 171, 83, 84, 1, 0.506024, 0.97619,[],[],0],
				["images/pepper-sheet1.png", 6995, 0, 0, 85, 82, 1, 0.505882, 0.97561,[],[],0],
				["images/pepper-sheet0.png", 58223, 1, 1, 87, 84, 1, 0.505747, 0.97619,[],[],0],
				["images/pepper-sheet0.png", 58223, 89, 1, 87, 84, 1, 0.505747, 0.97619,[],[],0],
				["images/pepper-sheet0.png", 58223, 1, 86, 87, 84, 1, 0.505747, 0.97619,[],[],0],
				["images/pepper-sheet0.png", 58223, 1, 171, 87, 83, 1, 0.505747, 0.975904,[],[],0],
				["images/pepper-sheet0.png", 58223, 89, 86, 87, 84, 1, 0.505747, 0.97619,[],[],0],
				["images/pepper-sheet0.png", 58223, 173, 171, 81, 84, 1, 0.506173, 0.97619,[],[],0]
			]
			]
		],
		[
		[
			"Bullet",
			cr.behaviors.Bullet
		]
,		[
			"DestroyOutsideLayout",
			cr.behaviors.destroy
		]
		],
		false,
		false,
		[]
	]
,	[
		"t33",
		cr.plugins_.Sprite,
		false,
		0,
		2,
		0,
		null,
		[
			[
			"Default",
			5,
			true,
			1,
			0,
			false,
			[
				["images/cucumber-sheet0.png", 43307, 163, 90, 76, 87, 1, 0.539474, 0.965517,[],[],0],
				["images/cucumber-sheet1.png", 13582, 1, 1, 75, 88, 1, 0.533333, 0.965909,[],[],0],
				["images/cucumber-sheet0.png", 43307, 1, 1, 80, 88, 1, 0.5375, 0.965909,[],[],0],
				["images/cucumber-sheet0.png", 43307, 82, 1, 80, 88, 1, 0.5375, 0.965909,[],[],0],
				["images/cucumber-sheet0.png", 43307, 163, 1, 80, 88, 1, 0.5375, 0.965909,[],[],0],
				["images/cucumber-sheet0.png", 43307, 1, 90, 80, 88, 1, 0.5375, 0.965909,[],[],0],
				["images/cucumber-sheet0.png", 43307, 82, 90, 80, 88, 1, 0.5375, 0.965909,[],[],0],
				["images/cucumber-sheet1.png", 13582, 77, 1, 71, 87, 1, 0.535211, 0.965517,[],[],0]
			]
			]
		],
		[
		[
			"Bullet",
			cr.behaviors.Bullet
		]
,		[
			"DestroyOutsideLayout",
			cr.behaviors.destroy
		]
		],
		false,
		false,
		[]
	]
,	[
		"t34",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			30,
			false,
			1,
			0,
			false,
			[
				["images/plusone-sheet0.png", 24488, 211, 1, 20, 17, 1, 0.5, 0.941176,[],[],0],
				["images/plusone-sheet0.png", 24488, 71, 121, 69, 58, 1, 0.507246, 0.948276,[],[],0],
				["images/plusone-sheet0.png", 24488, 1, 1, 69, 59, 1, 0.507246, 0.949153,[],[],0],
				["images/plusone-sheet0.png", 24488, 141, 180, 68, 58, 1, 0.5, 0.948276,[],[],0],
				["images/plusone-sheet0.png", 24488, 71, 1, 69, 59, 1, 0.507246, 0.949153,[],[],0],
				["images/plusone-sheet0.png", 24488, 141, 1, 69, 59, 1, 0.507246, 0.949153,[],[],0],
				["images/plusone-sheet0.png", 24488, 141, 121, 69, 58, 1, 0.507246, 0.948276,[],[],0],
				["images/plusone-sheet0.png", 24488, 71, 180, 69, 58, 1, 0.507246, 0.948276,[],[],0],
				["images/plusone-sheet0.png", 24488, 1, 61, 69, 59, 1, 0.507246, 0.949153,[],[],0],
				["images/plusone-sheet0.png", 24488, 71, 61, 69, 59, 1, 0.507246, 0.949153,[],[],0],
				["images/plusone-sheet0.png", 24488, 141, 61, 69, 59, 1, 0.507246, 0.949153,[],[],0],
				["images/plusone-sheet0.png", 24488, 1, 121, 69, 59, 1, 0.507246, 0.949153,[],[],0]
			]
			]
		],
		[
		[
			"Fade",
			cr.behaviors.Fade
		]
		],
		false,
		false,
		[]
	]
,	[
		"t35",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/energybar-sheet0.png", 255, 0, 0, 20, 427, 1, 0.5, 0.501171,[],[-0.05,-0.480094,0,-0.487119,0.1,-0.482436,0.1,-0.00234193,0,0.466042,-0.05,-0.00234193],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t36",
		cr.plugins_.Text,
		false,
		0,
		1,
		0,
		null,
		null,
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t37",
		cr.plugins_.Text,
		false,
		0,
		1,
		0,
		null,
		null,
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t38",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/sprite-sheet0.png", 1688, 0, 0, 73, 54, 1, 0.506849, 0.5,[],[-0.30137,-0.222222,-0.0136983,-0.388889,0.328767,-0.277778,0.424658,0,0.342466,0.296296,-0.0136983,0.388889,-0.315068,0.240741,-0.424657,0],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t39",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/burgericon-sheet0.png", 6239, 0, 0, 70, 55, 1, 0.5, 0.509091,[],[-0.342857,-0.309091,0,-0.454545,0.357143,-0.327273,0.428571,-0.0181819,0.4,0.363636,0,0.436364,-0.385714,0.345454,-0.414286,-0.0181819],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t40",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"PlayerIdle",
			7,
			true,
			1,
			0,
			false,
			[
				["images/playerlife1-sheet0.png", 197960, 1, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 98, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 195, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 292, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 389, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 1, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 98, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0]
			]
			]
,			[
			"IdleToRun",
			50,
			false,
			1,
			0,
			false,
			[
				["images/playerlife1-sheet1.png", 266116, 385, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 1, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 95, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 189, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 283, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 377, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 1, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 95, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
,			[
			"JumpFromRun",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerlife1-sheet2.png", 270738, 95, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 188, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 281, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 374, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife1-sheet3.png", 127447, 1, 165, 85, 163, 1, 0.447059, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 1, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 94, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 187, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0]
			]
			]
,			[
			"Run",
			20,
			true,
			1,
			0,
			true,
			[
				["images/playerlife1-sheet0.png", 197960, 292, 328, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 388, 328, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 1, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 373, 329, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife1-sheet3.png", 127447, 1, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 97, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 193, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 289, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife1-sheet3.png", 127447, 88, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife1-sheet3.png", 127447, 175, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife1-sheet3.png", 127447, 262, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife1-sheet3.png", 127447, 87, 165, 85, 161, 1, 0.447059, 0.993789,[],[],0],
				["images/playerlife1-sheet3.png", 127447, 349, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0]
			]
			]
,			[
			"JumpFromStand",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerlife1-sheet2.png", 270738, 280, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 189, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 283, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet1.png", 266116, 377, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 1, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 95, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 189, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 283, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 377, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
,			[
			"Shoot",
			10,
			false,
			1,
			0,
			false,
			[
				["images/playerlife1-sheet3.png", 127447, 436, 103, 72, 92, 1, 0.444444, 0.98913,[],[],0]
			]
			]
,			[
			"Hurt",
			75,
			false,
			1,
			0,
			false,
			[
				["images/playerlife1-sheet3.png", 127447, 436, 1, 72, 101, 1, 0.444444, 0.990099,[],[],0]
			]
			]
,			[
			"Fart",
			15,
			false,
			1,
			0,
			false,
			[
				["images/playerlife1-sheet0.png", 197960, 195, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 1, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 98, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 195, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 292, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife1-sheet0.png", 197960, 389, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife1-sheet2.png", 270738, 1, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t41",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"PlayerIdle",
			7,
			true,
			1,
			0,
			false,
			[
				["images/playerlife2-sheet0.png", 197960, 1, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 98, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 195, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 292, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 389, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 1, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 98, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0]
			]
			]
,			[
			"IdleToRun",
			50,
			false,
			1,
			0,
			false,
			[
				["images/playerlife2-sheet1.png", 266116, 385, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 1, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 95, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 189, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 283, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 377, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 1, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 95, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
,			[
			"JumpFromRun",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerlife2-sheet2.png", 270738, 95, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 188, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 281, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 374, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife2-sheet3.png", 127447, 1, 165, 85, 163, 1, 0.447059, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 1, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 94, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 187, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0]
			]
			]
,			[
			"Run",
			20,
			true,
			1,
			0,
			true,
			[
				["images/playerlife2-sheet0.png", 197960, 292, 328, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 388, 328, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 1, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 373, 329, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife2-sheet3.png", 127447, 1, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 97, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 193, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 289, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife2-sheet3.png", 127447, 88, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife2-sheet3.png", 127447, 175, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife2-sheet3.png", 127447, 262, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife2-sheet3.png", 127447, 87, 165, 85, 161, 1, 0.447059, 0.993789,[],[],0],
				["images/playerlife2-sheet3.png", 127447, 349, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0]
			]
			]
,			[
			"JumpFromStand",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerlife2-sheet2.png", 270738, 280, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 189, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 283, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet1.png", 266116, 377, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 1, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 95, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 189, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 283, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 377, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
,			[
			"Shoot",
			10,
			false,
			1,
			0,
			false,
			[
				["images/playerlife2-sheet3.png", 127447, 436, 103, 72, 92, 1, 0.444444, 0.98913,[],[],0]
			]
			]
,			[
			"Hurt",
			75,
			false,
			1,
			0,
			false,
			[
				["images/playerlife2-sheet3.png", 127447, 436, 1, 72, 101, 1, 0.444444, 0.990099,[],[],0]
			]
			]
,			[
			"Fart",
			15,
			false,
			1,
			0,
			false,
			[
				["images/playerlife2-sheet0.png", 197960, 195, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 1, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 98, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 195, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 292, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife2-sheet0.png", 197960, 389, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife2-sheet2.png", 270738, 1, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t42",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"PlayerIdle",
			7,
			true,
			1,
			0,
			false,
			[
				["images/playerlife3-sheet0.png", 197960, 1, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 98, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 195, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 292, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 389, 165, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 1, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 98, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0]
			]
			]
,			[
			"IdleToRun",
			50,
			false,
			1,
			0,
			false,
			[
				["images/playerlife3-sheet1.png", 266116, 385, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 1, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 95, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 189, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 283, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 377, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 1, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 95, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
,			[
			"JumpFromRun",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerlife3-sheet2.png", 270738, 95, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 188, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 281, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 374, 165, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife3-sheet3.png", 127447, 1, 165, 85, 163, 1, 0.447059, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 1, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 94, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 187, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0]
			]
			]
,			[
			"Run",
			20,
			true,
			1,
			0,
			true,
			[
				["images/playerlife3-sheet0.png", 197960, 292, 328, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 388, 328, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 1, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 373, 329, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife3-sheet3.png", 127447, 1, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 97, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 193, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 289, 1, 95, 163, 1, 0.452632, 0.993865,[],[],0],
				["images/playerlife3-sheet3.png", 127447, 88, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife3-sheet3.png", 127447, 175, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife3-sheet3.png", 127447, 262, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0],
				["images/playerlife3-sheet3.png", 127447, 87, 165, 85, 161, 1, 0.447059, 0.993789,[],[],0],
				["images/playerlife3-sheet3.png", 127447, 349, 1, 86, 163, 1, 0.453488, 0.993865,[],[],0]
			]
			]
,			[
			"JumpFromStand",
			5,
			false,
			1,
			0,
			false,
			[
				["images/playerlife3-sheet2.png", 270738, 280, 329, 92, 163, 1, 0.445652, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 189, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 283, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet1.png", 266116, 377, 329, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 1, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 95, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 189, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 283, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 377, 1, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
,			[
			"Shoot",
			10,
			false,
			1,
			0,
			false,
			[
				["images/playerlife3-sheet3.png", 127447, 436, 103, 72, 92, 1, 0.444444, 0.98913,[],[],0]
			]
			]
,			[
			"Hurt",
			75,
			false,
			1,
			0,
			false,
			[
				["images/playerlife3-sheet3.png", 127447, 436, 1, 72, 101, 1, 0.444444, 0.990099,[],[],0]
			]
			]
,			[
			"Fart",
			15,
			false,
			1,
			0,
			false,
			[
				["images/playerlife3-sheet0.png", 197960, 195, 328, 96, 162, 1, 0.447917, 0.993827,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 1, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 98, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 195, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 292, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife3-sheet0.png", 197960, 389, 1, 96, 163, 1, 0.447917, 0.993865,[],[],0],
				["images/playerlife3-sheet2.png", 270738, 1, 165, 93, 163, 1, 0.451613, 0.993865,[],[],0]
			]
			]
		],
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t43",
		cr.plugins_.Sprite,
		false,
		0,
		1,
		0,
		null,
		[
			[
			"Default",
			20,
			false,
			1,
			0,
			false,
			[
				["images/yuck-sheet0.png", 19959, 199, 1, 36, 28, 1, 0.611111, 0.964286,[],[],0],
				["images/yuck-sheet1.png", 10600, 1, 1, 98, 75, 1, 0.612245, 0.96,[],[],0],
				["images/yuck-sheet0.png", 19959, 1, 1, 98, 76, 1, 0.612245, 0.960526,[],[],0],
				["images/yuck-sheet1.png", 10600, 100, 1, 98, 75, 1, 0.612245, 0.96,[],[],0],
				["images/yuck-sheet0.png", 19959, 100, 1, 98, 76, 1, 0.612245, 0.960526,[],[],0],
				["images/yuck-sheet1.png", 10600, 1, 77, 98, 75, 1, 0.612245, 0.96,[],[],0],
				["images/yuck-sheet0.png", 19959, 1, 78, 98, 76, 1, 0.612245, 0.960526,[],[],0],
				["images/yuck-sheet0.png", 19959, 100, 78, 98, 76, 1, 0.612245, 0.960526,[],[],0],
				["images/yuck-sheet0.png", 19959, 1, 155, 98, 76, 1, 0.612245, 0.960526,[],[],0],
				["images/yuck-sheet0.png", 19959, 100, 155, 98, 76, 1, 0.612245, 0.960526,[],[],0]
			]
			]
		],
		[
		[
			"Fade",
			cr.behaviors.Fade
		]
		],
		false,
		false,
		[]
	]
,	[
		"t44",
		cr.plugins_.Text,
		false,
		0,
		1,
		0,
		null,
		null,
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t45",
		cr.plugins_.WebStorage,
		false,
		0,
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		[]
		,[]
	]
,	[
		"t46",
		cr.plugins_.Text,
		false,
		0,
		1,
		0,
		null,
		null,
		[
		[
			"Anchor",
			cr.behaviors.Anchor
		]
		],
		false,
		false,
		[]
	]
,	[
		"t47",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/pausescreen-sheet0.png", 74036, 0, 0, 500, 500, 1, 0.5, 0.5,[],[-0.46,-0.46,0.464,-0.464,0.482,0,0.46,0.46,-0.456,0.456,-0.47,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t48",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/contextscreenspawn-sheet0.png", 169, 0, 0, 256, 256, 1, 0.5, 0.5,[],[],3]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t49",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/gameoverscreen-sheet0.png", 64481, 0, 0, 500, 500, 1, 0.5, 0.5,[["highScoreText", 0.648, 0.536]],[-0.46,-0.46,0.464,-0.464,0.482,0,0.46,0.46,-0.456,0.456,-0.47,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t50",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/startscreen-sheet0.png", 269343, 0, 0, 960, 540, 1, 0.5, 0.5,[],[-0.488542,-0.47963,0.486458,-0.475926,0.484375,0.472222,-0.484375,0.472222],0]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
,	[
		"t51",
		cr.plugins_.Sprite,
		false,
		0,
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			[
				["images/customlogo-sheet0.png", 2309, 0, 0, 500, 500, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		[]
	]
	],
	[
	],
	[
	[
		"Level1",
		1920,
		1080,
		false,
		"Event sheet 1",
		[
		[
			"Background",
			0,
			true,
			[255, 255, 255],
			false,
			0.5,
			0.5,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[1024, 80, 0, 2848, 1984, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				21,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"MidGround",
			1,
			true,
			[255, 255, 255],
			true,
			0.5,
			0.5,
			1,
			false,
			1,
			0,
			0,
			[
			],
			[			]
		]
,		[
			"Game",
			2,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[320, 1056, 0, 70, 90, 0, 0, 1, 0.5, 1, 0, 0, []],
				0,
				[
					3
				],
				[
				[
					250,
					1500,
					1500,
					1000,
					2000,
					2000,
					1
				],
				[
				],
				[
					1
				]
				],
				[
					1,
					0,
					1
				]
			]
,			[
				[1376, 2272, 0, 60, 86, 0, 0, 1, 0.447917, 0.993827, 0, 0, []],
				3,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[1952, 960, 0, 128, 256, 0, 0, 0, 0.5, 0.5, 0, 0, []],
				9,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[512, 992, 0, 181, 131, 0, 0, 1, 0.502762, 0.503817, 0, 0, []],
				22,
				[
				],
				[
				[
					0,
					0,
					1,
					1,
					0.5,
					1,
					0,
					0.01,
					0
				],
				[
					1
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[32, 992, 0, 82, 93, 0, 0, 0, 0.5, 0.5, 0, 0, []],
				23,
				[
				],
				[
				[
					1,
					0,
					0,
					1,
					0.5,
					0.2,
					0,
					0.01,
					0
				],
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[0, 928, 0, 64, 256, 0, 0, 0, 0.5, 0.5, 0, 0, []],
				24,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[864, 912, 0, 192, 32, 0, 0, 0, 0.5, 0.5, 0, 0, []],
				25,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[960, 0, 0, 1920, 0, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				27,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[928, 96, 0, 83, 84, 0, 0, 1, 0.506024, 1, 0, 0, []],
				29,
				[
				],
				[
				[
					85,
					0,
					0,
					0,
					0
				],
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[864, -224, 0, 83, 84, 0, 0, 1, 0.506024, 0.97619, 0, 0, []],
				32,
				[
				],
				[
				[
					90,
					0,
					0,
					0,
					0
				],
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[512, -192, 0, 76, 87, 0, 0, 1, 0.539474, 0.965517, 0, 0, []],
				33,
				[
				],
				[
				[
					75,
					0,
					0,
					0,
					0
				],
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[960, -64, 0, 20, 17, 0, 0, 1, 0.5, 0.941176, 0, 0, []],
				34,
				[
				],
				[
				[
					0,
					0,
					0,
					0.5,
					1
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[109, 1079, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[333, 1080, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[557, 1082, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[782, 1084, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[1006, 1084, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[1230, 1084, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[1454, 1084, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[1645, 1085, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[192, 96, 0, 89, 80, 0, 0, 1, 0.505618, 0.9625, 0, 0, []],
				30,
				[
				],
				[
				[
					80,
					0,
					0,
					0,
					0
				],
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[576, -32, 0, 80, 79, 0, 0, 1, 0.5625, 1, 0, 0, []],
				26,
				[
				],
				[
				[
				],
				[
					50,
					0,
					0,
					0,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[1856, 1088, 0, 237.318, 43.1488, 0, 0, 1, 0.5, 0.506667, 0, 0, []],
				8,
				[
				],
				[
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[352, -32, 0, 75, 84, 0, 0, 1, 0.48, 0.988095, 0, 0, []],
				31,
				[
				],
				[
				[
					50,
					0,
					0,
					0,
					0
				],
				[
				]
				],
				[
					0,
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"UI",
			3,
			true,
			[255, 255, 255],
			true,
			0,
			0,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[1184, -320, 0, 397.11, 397.11, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				49,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[32, 32, 0, 70, 55, 0, 0, 1, 0.5, 0.509091, 0, 0, []],
				39,
				[
				],
				[
				[
					0,
					0,
					0,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[32, 96, 0, 73, 54, 0, 0, 1, 0.506849, 0.5, 0, 0, []],
				38,
				[
				],
				[
				[
					0,
					0,
					0,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[256, 736, 0, 80, 80, 0, 0, 0.5, 0.509259, 0.513514, 0, 0, []],
				11,
				[
				],
				[
				[
					0,
					1,
					0,
					0
				]
				],
				[
					1,
					0,
					1
				]
			]
,			[
				[160, 640, 0, 80, 80, 0, 0, 0.5, 0.509259, 0.513514, 0, 0, []],
				12,
				[
				],
				[
				[
					0,
					1,
					0,
					0
				]
				],
				[
					1,
					0,
					1
				]
			]
,			[
				[160, 736, 0, 80, 80, 0, 0, 0.5, 0.508772, 0.508772, 0, 0, []],
				14,
				[
				],
				[
				[
					0,
					1,
					0,
					0
				]
				],
				[
					1,
					0,
					1
				]
			]
,			[
				[960, 79, 0, 80, 80, 0, 0, 0.5, 0.508772, 0.508772, 0, 0, []],
				15,
				[
				],
				[
				[
					1,
					0,
					1,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[-1, 29, 0, 64, 32, 0, 0, 1, 0, 0, 0, 0, []],
				17,
				[
				],
				[
				[
					0,
					0,
					0,
					0
				]
				],
				[
					"Text",
					0,
					"12pt Arial Rounded MT Bold",
					"rgb(255,255,255)",
					1,
					0,
					0,
					0,
					0
				]
			]
,			[
				[64, -192, 0, 256, 64, 0, 0, 1, 0, 0, 0, 0, []],
				18,
				[
				],
				[
				[
					0,
					0,
					0,
					0
				]
				],
				[
					"Text",
					0,
					"24pt Arial Rounded MT Bold",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[2592, 2304, 0, 768, 160, 0, 0, 1, 0, 0, 0, 0, []],
				19,
				[
				],
				[
				],
				[
					"Text",
					1,
					"48pt Arial Rounded MT Bold",
					"rgb(255,255,255)",
					1,
					0,
					0,
					0,
					0
				]
			]
,			[
				[320, 2208, 0, 768, 160, 0, 0, 1, 0, 0, 0, 0, []],
				19,
				[
				],
				[
				],
				[
					"Text",
					1,
					"48pt Arial Rounded MT Bold",
					"rgb(255,255,255)",
					1,
					0,
					0,
					0,
					0
				]
			]
,			[
				[18, 529, 0, 30.26, 759.111, 0, 0, 1, 0.5, 0.501171, 0, 0, []],
				35,
				[
				],
				[
				[
					0,
					0,
					0,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[3, 128, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
				36,
				[
				],
				[
				[
					0,
					0,
					0,
					0
				]
				],
				[
					"Energy Level",
					0,
					"12pt Arial Rounded MT Bold",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[2, 85, 0, 64, 32, 0, 0, 1, 0, 0, 0, 0, []],
				37,
				[
				],
				[
				[
					0,
					0,
					0,
					0
				]
				],
				[
					"Text",
					0,
					"12pt Arial Rounded MT Bold",
					"rgb(255,255,255)",
					1,
					0,
					0,
					0,
					0
				]
			]
,			[
				[1888, 32, 0, 80, 80, 0, 0, 1, 0.508772, 0.508772, 0, 0, []],
				15,
				[
				],
				[
				[
					1,
					0,
					0,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[64, 736, 0, 80, 80, 0, 0, 1, 0.5, 0.504505, 0, 0, []],
				10,
				[
				],
				[
				[
					0,
					1,
					0,
					0
				]
				],
				[
					1,
					0,
					1
				]
			]
,			[
				[811, 96, 0, 34.8372, 58.7878, 0, 0, 0.5, 0.447917, 0.993827, 0, 0, []],
				40,
				[
				],
				[
				[
					1,
					0,
					0,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[851, 96, 0, 34.837, 58.788, 0, 0, 0.5, 0.447917, 0.993827, 0, 0, []],
				41,
				[
				],
				[
				[
					1,
					0,
					0,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[889, 96, 0, 34.387, 58.788, 0, 0, 0.5, 0.447917, 0.993827, 0, 0, []],
				42,
				[
				],
				[
				[
					1,
					0,
					0,
					0
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[928, -416, 0, 36, 28, 0, 0, 1, 0.611111, 0.964286, 0, 0, []],
				43,
				[
				],
				[
				[
					1,
					1,
					0,
					0.5,
					1
				]
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[926, 6, 0, 64, 32, 0, 0, 1, 0, 0, 0, 0, []],
				44,
				[
				],
				[
				[
					1,
					0,
					0,
					0
				]
				],
				[
					"text",
					0,
					"12pt Arial Rounded MT Bold",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[814, 4, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
				46,
				[
				],
				[
				[
					1,
					0,
					0,
					0
				]
				],
				[
					"High Score:",
					0,
					"12pt Arial Rounded MT Bold",
					"rgb(255,255,255)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[512, 320, 0, 256, 256, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				48,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
,			[
				[256, -352, 0, 397, 397, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				47,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Start",
		1920,
		1080,
		false,
		"Event sheet 1",
		[
		[
			"Layer 0",
			0,
			true,
			[255, 255, 255],
			false,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[514.934, 364.963, 0, 825.584, 464.391, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				50,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Branding",
		1920,
		1080,
		false,
		"Event sheet 1",
		[
		[
			"BrandingLayer",
			0,
			true,
			[255, 255, 255],
			false,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[491, 372, 0, 491.53, 491.53, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				51,
				[
				],
				[
				],
				[
					0,
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
	],
	[
	[
		"Event sheet 1",
		[
		[
			1,
			"inputType",
			1,
			"\"mouse\"",
false,false
		]
,		[
			1,
			"lastScore",
			0,
			0,
false,false
		]
,		[
			1,
			"life",
			0,
			3,
false,false
		]
,		[
			1,
			"fartCount",
			0,
			5,
false,false
		]
,		[
			1,
			"level",
			0,
			1,
false,false
		]
,		[
			1,
			"foodCount",
			0,
			0,
false,false
		]
,		[
			0,
			[false, "Core"],
			false,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false
				,[
				[
					1,
					[
						2,
						"Core"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.OnLayoutStart,
					null,
					1,
					false,
					false,
					false
				]
				],
				[
				[
					44,
					cr.plugins_.Text.prototype.acts.SetText,
					null
					,[
					[
						7,
						[
							20,
							45,
							cr.plugins_.WebStorage.prototype.exps.LocalValue,
							true,
							null
							,[
[
								2,
								"score"
							]
							]
						]
					]
					]
				]
,				[
					49,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null
					,[
					[
						11,
						"lastScore"
					]
,					[
						7,
						[
							20,
							45,
							cr.plugins_.WebStorage.prototype.exps.LocalValue,
							true,
							null
							,[
[
								2,
								"score"
							]
							]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false
				]
				],
				[
				[
					23,
					cr.plugins_.Sprite.prototype.acts.SetPos,
					null
					,[
					[
						0,
						[
							20,
							0,
							cr.plugins_.Sprite.prototype.exps.X,
							false,
							null
						]
					]
,					[
						0,
						[
							4,
							[
								20,
								0,
								cr.plugins_.Sprite.prototype.exps.Y,
								false,
								null
							]
							,[
								0,
								3
							]
						]
					]
					]
				]
,				[
					25,
					cr.plugins_.Sprite.prototype.acts.SetPosToObject,
					null
					,[
					[
						4,
						22
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					17,
					cr.plugins_.Text.prototype.acts.SetText,
					null
					,[
					[
						7,
						[
							23,
							"foodCount"
						]
					]
					]
				]
,				[
					18,
					cr.plugins_.Text.prototype.acts.SetText,
					null
					,[
					[
						7,
						[
							10,
							[
								2,
								"Level "
							]
							,[
								23,
								"level"
							]
						]
					]
					]
				]
,				[
					26,
					cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion,
					"Bullet"
					,[
					[
						0,
						[
							0,
							90
						]
					]
					]
				]
,				[
					31,
					cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion,
					"Bullet"
					,[
					[
						0,
						[
							0,
							90
						]
					]
					]
				]
,				[
					33,
					cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion,
					"Bullet"
					,[
					[
						0,
						[
							0,
							90
						]
					]
					]
				]
,				[
					29,
					cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion,
					"Bullet"
					,[
					[
						0,
						[
							0,
							90
						]
					]
					]
				]
,				[
					32,
					cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion,
					"Bullet"
					,[
					[
						0,
						[
							0,
							90
						]
					]
					]
				]
,				[
					30,
					cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion,
					"Bullet"
					,[
					[
						0,
						[
							0,
							90
						]
					]
					]
				]
,				[
					35,
					cr.plugins_.Sprite.prototype.acts.SetHeight,
					null
					,[
					[
						0,
						[
							22,
							0,
							"Platform",
							cr.behaviors.Platform.prototype.exps.MaxSpeed,
							false,
							null
						]
					]
					]
				]
,				[
					37,
					cr.plugins_.Text.prototype.acts.SetText,
					null
					,[
					[
						7,
						[
							23,
							"fartCount"
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"life"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							2
						]
					]
					]
				]
				],
				[
				[
					40,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"life"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					41,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"life"
					]
,					[
						8,
						3
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				],
				[
				[
					42,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"foodCount"
					]
,					[
						8,
						4
					]
,					[
						7,
						[
							23,
							"lastScore"
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null
					,[
					[
						11,
						"lastScore"
					]
,					[
						7,
						[
							23,
							"foodCount"
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
					null,
					0,
					false,
					false,
					false
					,[
					[
						9,
						87
					]
					]
				]
				],
				[
				[
					0,
					cr.behaviors.Platform.prototype.acts.SimulateControl,
					"Platform"
					,[
					[
						3,
						2
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
					null,
					0,
					false,
					false,
					false
					,[
					[
						9,
						65
					]
					]
				]
				],
				[
				[
					0,
					cr.behaviors.Platform.prototype.acts.SimulateControl,
					"Platform"
					,[
					[
						3,
						0
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
					null,
					0,
					false,
					false,
					false
					,[
					[
						9,
						83
					]
					]
				]
				],
				[
				[
					0,
					cr.behaviors.Platform.prototype.acts.FallThrough,
					"Platform"
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
					null,
					0,
					false,
					false,
					false
					,[
					[
						9,
						68
					]
					]
				]
				],
				[
				[
					0,
					cr.behaviors.Platform.prototype.acts.SimulateControl,
					"Platform"
					,[
					[
						3,
						1
					]
					]
				]
				]
			]
,			[
				0,
				null,
				true,
				[
				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.OnKey,
					null,
					1,
					false,
					false,
					false
					,[
					[
						9,
						37
					]
					]
				]
,				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.OnKey,
					null,
					1,
					false,
					false,
					false
					,[
					[
						9,
						65
					]
					]
				]
				],
				[
				[
					0,
					cr.plugins_.Sprite.prototype.acts.SetMirrored,
					null
					,[
					[
						3,
						0
					]
					]
				]
,				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetMirrored,
					null
					,[
					[
						3,
						0
					]
					]
				]
				]
			]
,			[
				0,
				null,
				true,
				[
				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.OnKey,
					null,
					1,
					false,
					false,
					false
					,[
					[
						9,
						39
					]
					]
				]
,				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.OnKey,
					null,
					1,
					false,
					false,
					false
					,[
					[
						9,
						68
					]
					]
				]
				],
				[
				[
					0,
					cr.plugins_.Sprite.prototype.acts.SetMirrored,
					null
					,[
					[
						3,
						1
					]
					]
				]
,				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetMirrored,
					null
					,[
					[
						3,
						1
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.OnKey,
					null,
					1,
					false,
					false,
					false
					,[
					[
						9,
						32
					]
					]
				]
				],
				[
				[
					6,
					cr.plugins_.Rex_Pause.prototype.acts.TooglePause,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					1,
					cr.plugins_.Keyboard.prototype.cnds.OnKey,
					null,
					1,
					false,
					false,
					false
					,[
					[
						9,
						40
					]
					]
				]
				],
				[
				[
					0,
					cr.behaviors.Platform.prototype.acts.FallThrough,
					"Platform"
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.plugins_.Sprite.prototype.cnds.CompareY,
					null,
					0,
					false,
					false,
					false
					,[
					[
						8,
						4
					]
,					[
						0,
						[
							19,
							cr.system_object.prototype.exps.layoutheight
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.RestartLayout,
					null
				]
,				[
					-1,
					cr.system_object.prototype.acts.ResetGlobals,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false
				]
				],
				[
				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetPosToObject,
					null
					,[
					[
						4,
						0
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.behaviors.Platform.prototype.cnds.OnMove,
					"Platform",
					1,
					false,
					false,
					false
				]
				],
				[
				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetAnim,
					null
					,[
					[
						1,
						[
							2,
							"IdleToRun"
						]
					]
,					[
						3,
						1
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					3,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"IdleToRun"
						]
					]
					]
				]
				],
				[
				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetAnim,
					null
					,[
					[
						1,
						[
							2,
							"Run"
						]
					]
,					[
						3,
						1
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.behaviors.Platform.prototype.cnds.OnStop,
					"Platform",
					1,
					false,
					false,
					false
				]
				],
				[
				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetAnim,
					null
					,[
					[
						1,
						[
							2,
							"PlayerIdle"
						]
					]
,					[
						3,
						1
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.behaviors.Platform.prototype.cnds.OnJump,
					"Platform",
					1,
					false,
					false,
					false
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						0,
						cr.behaviors.Platform.prototype.cnds.IsMoving,
						"Platform",
						0,
						false,
						false,
						false
					]
					],
					[
					[
						3,
						cr.plugins_.Sprite.prototype.acts.SetAnim,
						null
						,[
						[
							1,
							[
								2,
								"JumpFromRun"
							]
						]
,						[
							3,
							1
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					[
					[
						0,
						cr.behaviors.Platform.prototype.cnds.IsMoving,
						"Platform",
						0,
						false,
						true,
						false
					]
					],
					[
					[
						3,
						cr.plugins_.Sprite.prototype.acts.SetAnim,
						null
						,[
						[
							1,
							[
								2,
								"JumpFromStand"
							]
						]
,						[
							3,
							1
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.behaviors.Platform.prototype.cnds.OnLand,
					"Platform",
					1,
					false,
					false,
					false
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						0,
						cr.behaviors.Platform.prototype.cnds.IsMoving,
						"Platform",
						0,
						false,
						false,
						false
					]
					],
					[
					[
						3,
						cr.plugins_.Sprite.prototype.acts.SetAnim,
						null
						,[
						[
							1,
							[
								2,
								"Run"
							]
						]
,						[
							3,
							1
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					[
					[
						0,
						cr.behaviors.Platform.prototype.cnds.IsMoving,
						"Platform",
						0,
						false,
						true,
						false
					]
					],
					[
					[
						3,
						cr.plugins_.Sprite.prototype.acts.SetAnim,
						null
						,[
						[
							1,
							[
								2,
								"PlayerIdle"
							]
						]
,						[
							3,
							1
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					4,
					cr.plugins_.Mouse.prototype.cnds.OnClick,
					null,
					1,
					false,
					false,
					false
					,[
					[
						3,
						2
					]
,					[
						3,
						0
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"fartCount"
					]
,					[
						8,
						4
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					true,
					false
					,[
					[
						11,
						"fartCount"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				],
				[
				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetAnim,
					null
					,[
					[
						1,
						[
							2,
							"Fart"
						]
					]
,					[
						3,
						1
					]
					]
				]
,				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["fart_short_ripper-soundbible.com-1317602707",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							2
						]
					]
,					[
						1,
						[
							2,
							"fart"
						]
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
					"Platform"
					,[
					[
						0,
						[
							4,
							[
								22,
								0,
								"Platform",
								cr.behaviors.Platform.prototype.exps.MaxSpeed,
								false,
								null
							]
							,[
								0,
								500
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.Wait,
					null
					,[
					[
						0,
						[
							0,
							1
						]
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
					"Platform"
					,[
					[
						0,
						[
							5,
							[
								22,
								0,
								"Platform",
								cr.behaviors.Platform.prototype.exps.MaxSpeed,
								false,
								null
							]
							,[
								0,
								500
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SubVar,
					null
					,[
					[
						11,
						"fartCount"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					3,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"Fart"
						]
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						0,
						cr.behaviors.Platform.prototype.cnds.IsMoving,
						"Platform",
						0,
						false,
						false,
						false
					]
					],
					[
					[
						3,
						cr.plugins_.Sprite.prototype.acts.SetAnim,
						null
						,[
						[
							1,
							[
								2,
								"Run"
							]
						]
,						[
							3,
							1
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					[
					[
						0,
						cr.behaviors.Platform.prototype.cnds.IsMoving,
						"Platform",
						0,
						false,
						true,
						false
					]
					],
					[
					[
						3,
						cr.plugins_.Sprite.prototype.acts.SetAnim,
						null
						,[
						[
							1,
							[
								2,
								"PlayerIdle"
							]
						]
,						[
							3,
							1
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					5,
					cr.plugins_.Touch.prototype.cnds.IsTouchingObject,
					null,
					0,
					false,
					false,
					false
					,[
					[
						4,
						10
					]
					]
				]
				],
				[
				[
					0,
					cr.plugins_.Sprite.prototype.acts.SetMirrored,
					null
					,[
					[
						3,
						0
					]
					]
				]
,				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetMirrored,
					null
					,[
					[
						3,
						0
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SimulateControl,
					"Platform"
					,[
					[
						3,
						0
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					5,
					cr.plugins_.Touch.prototype.cnds.IsTouchingObject,
					null,
					0,
					false,
					false,
					false
					,[
					[
						4,
						11
					]
					]
				]
				],
				[
				[
					0,
					cr.plugins_.Sprite.prototype.acts.SetMirrored,
					null
					,[
					[
						3,
						1
					]
					]
				]
,				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetMirrored,
					null
					,[
					[
						3,
						1
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SimulateControl,
					"Platform"
					,[
					[
						3,
						1
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					5,
					cr.plugins_.Touch.prototype.cnds.IsTouchingObject,
					null,
					0,
					false,
					false,
					false
					,[
					[
						4,
						12
					]
					]
				]
				],
				[
				[
					0,
					cr.behaviors.Platform.prototype.acts.SimulateControl,
					"Platform"
					,[
					[
						3,
						2
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					5,
					cr.plugins_.Touch.prototype.cnds.IsTouchingObject,
					null,
					0,
					false,
					false,
					false
					,[
					[
						4,
						13
					]
					]
				]
				],
				[
				[
					0,
					cr.behaviors.Platform.prototype.acts.FallThrough,
					"Platform"
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					5,
					cr.plugins_.Touch.prototype.cnds.OnTouchObject,
					null,
					1,
					false,
					false,
					false
					,[
					[
						4,
						14
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"fartCount"
					]
,					[
						8,
						4
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					true,
					false
					,[
					[
						11,
						"fartCount"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				],
				[
				[
					3,
					cr.plugins_.Sprite.prototype.acts.SetAnim,
					null
					,[
					[
						1,
						[
							2,
							"Fart"
						]
					]
,					[
						3,
						1
					]
					]
				]
,				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["fart_short_ripper-soundbible.com-1317602707",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							2
						]
					]
,					[
						1,
						[
							2,
							"fart"
						]
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
					"Platform"
					,[
					[
						0,
						[
							4,
							[
								22,
								0,
								"Platform",
								cr.behaviors.Platform.prototype.exps.MaxSpeed,
								false,
								null
							]
							,[
								0,
								500
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.Wait,
					null
					,[
					[
						0,
						[
							0,
							1
						]
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
					"Platform"
					,[
					[
						0,
						[
							5,
							[
								22,
								0,
								"Platform",
								cr.behaviors.Platform.prototype.exps.MaxSpeed,
								false,
								null
							]
							,[
								0,
								500
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SubVar,
					null
					,[
					[
						11,
						"fartCount"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					6,
					cr.plugins_.Rex_Pause.prototype.cnds.OnPause,
					null,
					1,
					false,
					false,
					false
				]
				],
				[
				[
					7,
					cr.plugins_.Audio.prototype.acts.Stop,
					null
					,[
					[
						1,
						[
							2,
							"bgMusic"
						]
					]
					]
				]
,				[
					48,
					cr.plugins_.Sprite.prototype.acts.Spawn,
					null
					,[
					[
						4,
						47
					]
,					[
						5,
						[
							0,
							3
						]
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					6,
					cr.plugins_.Rex_Pause.prototype.cnds.OnResume,
					null,
					1,
					false,
					false,
					false
				]
				],
				[
				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["game1bg",false]
					]
,					[
						3,
						1
					]
,					[
						0,
						[
							0,
							0
						]
					]
,					[
						1,
						[
							2,
							"bgMusic"
						]
					]
					]
				]
,				[
					47,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.OnLayoutEnd,
					null,
					1,
					false,
					false,
					false
				]
				],
				[
				[
					7,
					cr.plugins_.Audio.prototype.acts.Stop,
					null
					,[
					[
						1,
						[
							2,
							"bgMusic"
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.plugins_.Sprite.prototype.cnds.IsOnScreen,
					null,
					0,
					false,
					false,
					false
				]
,				[
					-1,
					cr.system_object.prototype.cnds.TriggerOnce,
					null,
					0,
					false,
					false,
					false
				]
				],
				[
				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["game1bg",false]
					]
,					[
						3,
						1
					]
,					[
						0,
						[
							0,
							0
						]
					]
,					[
						1,
						[
							2,
							"bgMusic"
						]
					]
					]
				]
,				[
					19,
					cr.plugins_.Text.prototype.acts.SetVisible,
					null
					,[
					[
						3,
						1
					]
					]
				]
,				[
					19,
					cr.plugins_.Text.prototype.acts.SetText,
					null
					,[
					[
						7,
						[
							10,
							[
								2,
								"Level "
							]
							,[
								23,
								"level"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.Wait,
					null
					,[
					[
						0,
						[
							0,
							3
						]
					]
					]
				]
,				[
					19,
					cr.plugins_.Text.prototype.acts.SetVisible,
					null
					,[
					[
						3,
						0
					]
					]
				]
,				[
					19,
					cr.plugins_.Text.prototype.acts.SetText,
					null
					,[
					[
						7,
						[
							2,
							""
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					5,
					cr.plugins_.Touch.prototype.cnds.IsTouchingObject,
					null,
					0,
					false,
					false,
					false
					,[
					[
						4,
						15
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.TriggerOnce,
					null,
					0,
					false,
					false,
					false
				]
				],
				[
				[
					6,
					cr.plugins_.Rex_Pause.prototype.acts.TooglePause,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					22,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						9
					]
					]
				]
				],
				[
				[
					22,
					cr.plugins_.Sprite.prototype.acts.SetPos,
					null
					,[
					[
						0,
						[
							5,
							[
								20,
								9,
								cr.plugins_.Sprite.prototype.exps.X,
								false,
								null
							]
							,[
								0,
								200
							]
						]
					]
,					[
						0,
						[
							20,
							0,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					22,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						24
					]
					]
				]
				],
				[
				[
					22,
					cr.plugins_.Sprite.prototype.acts.SetPos,
					null
					,[
					[
						0,
						[
							4,
							[
								20,
								24,
								cr.plugins_.Sprite.prototype.exps.X,
								false,
								null
							]
							,[
								0,
								200
							]
						]
					]
,					[
						0,
						[
							20,
							0,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						26
					]
					]
				]
				],
				[
				[
					26,
					cr.plugins_.Sprite.prototype.acts.SetAnim,
					null
					,[
					[
						1,
						[
							2,
							"burgerCollected"
						]
					]
,					[
						3,
						1
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null
						,[
						[
							11,
							"foodCount"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null
						,[
						[
							11,
							"fartCount"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						7,
						cr.plugins_.Audio.prototype.acts.Play,
						null
						,[
						[
							2,
							["belchpublicdomain",false]
						]
,						[
							3,
							0
						]
,						[
							0,
							[
								0,
								2
							]
						]
,						[
							1,
							[
								2,
								"belch"
							]
						]
						]
					]
,					[
						0,
						cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
						"Platform"
						,[
						[
							0,
							[
								4,
								[
									22,
									0,
									"Platform",
									cr.behaviors.Platform.prototype.exps.MaxSpeed,
									false,
									null
								]
								,[
									0,
									10
								]
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					26,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"burgerCollected"
						]
					]
					]
				]
				],
				[
				[
					26,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						29
					]
					]
				]
				],
				[
				[
					29,
					cr.plugins_.Sprite.prototype.acts.SetAnim,
					null
					,[
					[
						1,
						[
							2,
							"pancakeCollected"
						]
					]
,					[
						3,
						1
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null
						,[
						[
							11,
							"foodCount"
						]
,						[
							7,
							[
								0,
								3
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null
						,[
						[
							11,
							"fartCount"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						7,
						cr.plugins_.Audio.prototype.acts.Play,
						null
						,[
						[
							2,
							["belchpublicdomain",false]
						]
,						[
							3,
							0
						]
,						[
							0,
							[
								0,
								2
							]
						]
,						[
							1,
							[
								2,
								"belch"
							]
						]
						]
					]
,					[
						0,
						cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
						"Platform"
						,[
						[
							0,
							[
								4,
								[
									22,
									0,
									"Platform",
									cr.behaviors.Platform.prototype.exps.MaxSpeed,
									false,
									null
								]
								,[
									0,
									10
								]
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					29,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"pancakeCollected"
						]
					]
					]
				]
				],
				[
				[
					29,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					0,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						30
					]
					]
				]
				],
				[
				[
					30,
					cr.plugins_.Sprite.prototype.acts.SetAnim,
					null
					,[
					[
						1,
						[
							2,
							"pizzaCollected"
						]
					]
,					[
						3,
						1
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null
						,[
						[
							11,
							"foodCount"
						]
,						[
							7,
							[
								0,
								2
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null
						,[
						[
							11,
							"fartCount"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						7,
						cr.plugins_.Audio.prototype.acts.Play,
						null
						,[
						[
							2,
							["belchpublicdomain",false]
						]
,						[
							3,
							0
						]
,						[
							0,
							[
								0,
								2
							]
						]
,						[
							1,
							[
								2,
								"belch"
							]
						]
						]
					]
,					[
						0,
						cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
						"Platform"
						,[
						[
							0,
							[
								4,
								[
									22,
									0,
									"Platform",
									cr.behaviors.Platform.prototype.exps.MaxSpeed,
									false,
									null
								]
								,[
									0,
									10
								]
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					30,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"pizzaCollected"
						]
					]
					]
				]
				],
				[
				[
					30,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Every,
					null,
					0,
					false,
					false,
					false
					,[
					[
						0,
						[
							0,
							10
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.CreateObject,
					null
					,[
					[
						4,
						26
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						0,
						[
							4,
							[
								19,
								cr.system_object.prototype.exps.random
								,[
[
									20,
									22,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								]
							]
							,[
								19,
								cr.system_object.prototype.exps.random
								,[
[
									20,
									0,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								]
							]
						]
					]
,					[
						0,
						[
							20,
							27,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Every,
					null,
					0,
					false,
					false,
					false
					,[
					[
						0,
						[
							0,
							12
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.CreateObject,
					null
					,[
					[
						4,
						31
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						0,
						[
							4,
							[
								19,
								cr.system_object.prototype.exps.random
								,[
[
									20,
									22,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								]
							]
							,[
								19,
								cr.system_object.prototype.exps.random
								,[
[
									20,
									0,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								]
							]
						]
					]
,					[
						0,
						[
							20,
							27,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Every,
					null,
					0,
					false,
					false,
					false
					,[
					[
						0,
						[
							0,
							20
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.CreateObject,
					null
					,[
					[
						4,
						30
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						0,
						[
							19,
							cr.system_object.prototype.exps.random
							,[
[
								4,
								[
									20,
									22,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								,[
									19,
									cr.system_object.prototype.exps.random
									,[
[
										20,
										0,
										cr.plugins_.Sprite.prototype.exps.X,
										false,
										null
									]
									]
								]
							]
							]
						]
					]
,					[
						0,
						[
							20,
							27,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Every,
					null,
					0,
					false,
					false,
					false
					,[
					[
						0,
						[
							0,
							22
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.CreateObject,
					null
					,[
					[
						4,
						33
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						0,
						[
							4,
							[
								19,
								cr.system_object.prototype.exps.random
								,[
[
									20,
									22,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								]
							]
							,[
								19,
								cr.system_object.prototype.exps.random
								,[
[
									20,
									0,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								]
							]
						]
					]
,					[
						0,
						[
							20,
							27,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Every,
					null,
					0,
					false,
					false,
					false
					,[
					[
						0,
						[
							0,
							40
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.CreateObject,
					null
					,[
					[
						4,
						29
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						0,
						[
							19,
							cr.system_object.prototype.exps.random
							,[
[
								4,
								[
									20,
									22,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								,[
									19,
									cr.system_object.prototype.exps.random
									,[
[
										20,
										0,
										cr.plugins_.Sprite.prototype.exps.X,
										false,
										null
									]
									]
								]
							]
							]
						]
					]
,					[
						0,
						[
							20,
							27,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Every,
					null,
					0,
					false,
					false,
					false
					,[
					[
						0,
						[
							0,
							42
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.CreateObject,
					null
					,[
					[
						4,
						32
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						0,
						[
							19,
							cr.system_object.prototype.exps.random
							,[
[
								4,
								[
									20,
									22,
									cr.plugins_.Sprite.prototype.exps.X,
									false,
									null
								]
								,[
									19,
									cr.system_object.prototype.exps.random
									,[
[
										20,
										0,
										cr.plugins_.Sprite.prototype.exps.X,
										false,
										null
									]
									]
								]
							]
							]
						]
					]
,					[
						0,
						[
							20,
							27,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					31,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						25
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null
					,[
					[
						11,
						"foodCount"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["hitting_metal-douglas_vicente-1756278897",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							3
						]
					]
,					[
						1,
						[
							2,
							"plusOne"
						]
					]
					]
				]
,				[
					31,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
,				[
					25,
					cr.plugins_.Sprite.prototype.acts.Spawn,
					null
					,[
					[
						4,
						34
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					34,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"Default"
						]
					]
					]
				]
				],
				[
				[
					34,
					cr.behaviors.Fade.prototype.acts.StartFade,
					"Fade"
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					33,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						25
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null
					,[
					[
						11,
						"foodCount"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["hitting_metal-douglas_vicente-1756278897",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							3
						]
					]
,					[
						1,
						[
							2,
							"plusOne"
						]
					]
					]
				]
,				[
					33,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
,				[
					25,
					cr.plugins_.Sprite.prototype.acts.Spawn,
					null
					,[
					[
						4,
						34
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					34,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"Default"
						]
					]
					]
				]
				],
				[
				[
					34,
					cr.behaviors.Fade.prototype.acts.StartFade,
					"Fade"
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					32,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						25
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null
					,[
					[
						11,
						"foodCount"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["hitting_metal-douglas_vicente-1756278897",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							3
						]
					]
,					[
						1,
						[
							2,
							"plusOne"
						]
					]
					]
				]
,				[
					32,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
,				[
					25,
					cr.plugins_.Sprite.prototype.acts.Spawn,
					null
					,[
					[
						4,
						34
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					34,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"Default"
						]
					]
					]
				]
				],
				[
				[
					34,
					cr.behaviors.Fade.prototype.acts.StartFade,
					"Fade"
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					31,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						0
					]
					]
				]
				],
				[
				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["cough-soundbible.com-1409703798",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							3
						]
					]
,					[
						1,
						[
							2,
							"yuckCough"
						]
					]
					]
				]
,				[
					0,
					cr.plugins_.Sprite.prototype.acts.Spawn,
					null
					,[
					[
						4,
						43
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
					"Platform"
					,[
					[
						0,
						[
							5,
							[
								22,
								0,
								"Platform",
								cr.behaviors.Platform.prototype.exps.MaxSpeed,
								false,
								null
							]
							,[
								0,
								100
							]
						]
					]
					]
				]
,				[
					31,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					33,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						0
					]
					]
				]
				],
				[
				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["cough-soundbible.com-1409703798",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							3
						]
					]
,					[
						1,
						[
							2,
							"yuckCough"
						]
					]
					]
				]
,				[
					0,
					cr.plugins_.Sprite.prototype.acts.Spawn,
					null
					,[
					[
						4,
						43
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
					"Platform"
					,[
					[
						0,
						[
							5,
							[
								22,
								0,
								"Platform",
								cr.behaviors.Platform.prototype.exps.MaxSpeed,
								false,
								null
							]
							,[
								0,
								100
							]
						]
					]
					]
				]
,				[
					33,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					32,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						0
					]
					]
				]
				],
				[
				[
					7,
					cr.plugins_.Audio.prototype.acts.Play,
					null
					,[
					[
						2,
						["cough-soundbible.com-1409703798",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							3
						]
					]
,					[
						1,
						[
							2,
							"yuckCough"
						]
					]
					]
				]
,				[
					0,
					cr.plugins_.Sprite.prototype.acts.Spawn,
					null
					,[
					[
						4,
						43
					]
,					[
						5,
						[
							0,
							2
						]
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					0,
					cr.behaviors.Platform.prototype.acts.SetMaxSpeed,
					"Platform"
					,[
					[
						0,
						[
							5,
							[
								22,
								0,
								"Platform",
								cr.behaviors.Platform.prototype.exps.MaxSpeed,
								false,
								null
							]
							,[
								0,
								100
							]
						]
					]
					]
				]
,				[
					32,
					cr.plugins_.Sprite.prototype.acts.Destroy,
					null
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					43,
					cr.plugins_.Sprite.prototype.cnds.OnAnimFinished,
					null,
					1,
					false,
					false,
					false
					,[
					[
						1,
						[
							2,
							"Default"
						]
					]
					]
				]
				],
				[
				[
					43,
					cr.behaviors.Fade.prototype.acts.StartFade,
					"Fade"
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					31,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						8
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"life"
					]
,					[
						8,
						4
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SubVar,
						null
						,[
						[
							11,
							"life"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					33,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						8
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"life"
					]
,					[
						8,
						4
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SubVar,
						null
						,[
						[
							11,
							"life"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					32,
					cr.plugins_.Sprite.prototype.cnds.OnCollision,
					null,
					0,
					false,
					false,
					true
					,[
					[
						4,
						8
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"life"
					]
,					[
						8,
						4
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SubVar,
					null
					,[
					[
						11,
						"life"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					[
					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SubVar,
						null
						,[
						[
							11,
							"life"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"life"
					]
,					[
						8,
						3
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				],
				[
				[
					45,
					cr.plugins_.WebStorage.prototype.acts.StoreLocal,
					null
					,[
					[
						1,
						[
							2,
							"score"
						]
					]
,					[
						7,
						[
							23,
							"lastScore"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.CreateObject,
					null
					,[
					[
						4,
						49
					]
,					[
						5,
						[
							0,
							3
						]
					]
,					[
						0,
						[
							20,
							48,
							cr.plugins_.Sprite.prototype.exps.X,
							false,
							null
						]
					]
,					[
						0,
						[
							20,
							48,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.ResetGlobals,
					null
				]
,				[
					7,
					cr.plugins_.Audio.prototype.acts.Stop,
					null
					,[
					[
						1,
						[
							2,
							"bgMusic"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetTimescale,
					null
					,[
					[
						0,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetGroupActive,
					null
					,[
					[
						1,
						[
							2,
							"Core"
						]
					]
,					[
						3,
						0
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Every,
					null,
					0,
					false,
					false,
					false
					,[
					[
						0,
						[
							0,
							60
						]
					]
					]
				]
				],
				[
				[
					31,
					cr.behaviors.Bullet.prototype.acts.SetSpeed,
					"Bullet"
					,[
					[
						0,
						[
							4,
							[
								22,
								31,
								"Bullet",
								cr.behaviors.Bullet.prototype.exps.Speed,
								false,
								null
							]
							,[
								0,
								15
							]
						]
					]
					]
				]
,				[
					33,
					cr.behaviors.Bullet.prototype.acts.SetSpeed,
					"Bullet"
					,[
					[
						0,
						[
							4,
							[
								22,
								33,
								"Bullet",
								cr.behaviors.Bullet.prototype.exps.Speed,
								false,
								null
							]
							,[
								0,
								15
							]
						]
					]
					]
				]
,				[
					32,
					cr.behaviors.Bullet.prototype.acts.SetSpeed,
					"Bullet"
					,[
					[
						0,
						[
							4,
							[
								22,
								32,
								"Bullet",
								cr.behaviors.Bullet.prototype.exps.Speed,
								false,
								null
							]
							,[
								0,
								15
							]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				[
				[
					-1,
					cr.system_object.prototype.cnds.OnLayoutStart,
					null,
					1,
					false,
					false,
					false
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false
					,[
					[
						11,
						"inputType"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"touch"
						]
					]
					]
				]
				],
				[
				[
					14,
					cr.plugins_.Sprite.prototype.acts.SetVisible,
					null
					,[
					[
						3,
						1
					]
					]
				]
,				[
					10,
					cr.plugins_.Sprite.prototype.acts.SetVisible,
					null
					,[
					[
						3,
						1
					]
					]
				]
,				[
					11,
					cr.plugins_.Sprite.prototype.acts.SetVisible,
					null
					,[
					[
						3,
						1
					]
					]
				]
,				[
					12,
					cr.plugins_.Sprite.prototype.acts.SetVisible,
					null
					,[
					[
						3,
						1
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			[
			[
				-1,
				cr.system_object.prototype.cnds.OnLayoutStart,
				null,
				1,
				false,
				false,
				false
			]
,			[
				-1,
				cr.system_object.prototype.cnds.LayerVisible,
				null,
				0,
				false,
				false,
				false
				,[
				[
					5,
					[
						2,
						"BrandingLayer"
					]
				]
				]
			]
			],
			[
			[
				-1,
				cr.system_object.prototype.acts.SetTimescale,
				null
				,[
				[
					0,
					[
						1,
						1
					]
				]
				]
			]
,			[
				7,
				cr.plugins_.Audio.prototype.acts.Preload,
				null
				,[
				[
					2,
					["game1bg",false]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.Wait,
				null
				,[
				[
					0,
					[
						1,
						2.5
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null
				,[
				[
					6,
					"Start"
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			[
			[
				5,
				cr.plugins_.Touch.prototype.cnds.OnTouchObject,
				null,
				1,
				false,
				false,
				false
				,[
				[
					4,
					50
				]
				]
			]
			],
			[
			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null
				,[
				[
					11,
					"inputType"
				]
,				[
					7,
					[
						2,
						"touch"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetGroupActive,
				null
				,[
				[
					1,
					[
						2,
						"Core"
					]
				]
,				[
					3,
					1
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null
				,[
				[
					6,
					"Level1"
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			[
			[
				4,
				cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
				null,
				1,
				false,
				false,
				false
				,[
				[
					3,
					0
				]
,				[
					3,
					0
				]
,				[
					4,
					50
				]
				]
			]
			],
			[
			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null
				,[
				[
					11,
					"inputType"
				]
,				[
					7,
					[
						2,
						"mouse"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetGroupActive,
				null
				,[
				[
					1,
					[
						2,
						"Core"
					]
				]
,				[
					3,
					1
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null
				,[
				[
					6,
					"Level1"
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			[
			[
				-1,
				cr.system_object.prototype.cnds.OnLayoutStart,
				null,
				1,
				false,
				false,
				false
			]
			],
			[
			[
				-1,
				cr.system_object.prototype.acts.SetTimescale,
				null
				,[
				[
					0,
					[
						1,
						1
					]
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			[
			[
				5,
				cr.plugins_.Touch.prototype.cnds.OnTouchObject,
				null,
				1,
				false,
				false,
				false
				,[
				[
					4,
					49
				]
				]
			]
			],
			[
			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null
				,[
				[
					6,
					"Branding"
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			[
			[
				4,
				cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
				null,
				1,
				false,
				false,
				false
				,[
				[
					3,
					0
				]
,				[
					3,
					0
				]
,				[
					4,
					49
				]
				]
			]
			],
			[
			[
				-1,
				cr.system_object.prototype.acts.GoToLayoutByName,
				null
				,[
				[
					1,
					[
						2,
						"Branding"
					]
				]
				]
			]
			]
		]
		]
	]
	],
	"media/",
	false,
	1024,
	768,
	1,
	true,
	true,
	true,
	"1.0",
	1,
	false,
	0,
	false,
	[
	]
];};
