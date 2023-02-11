const UNICODE_MAPPING = new Map();

export const shift_jis = (value) => (data, version) => {
  data.push(0b1000, 4);
  data.push(value.length, version < 10 ? 8 : version < 27 ? 10 : 12);
  for (const c of value) {
    data.push(UNICODE_MAPPING.get(c.charCodeAt(0)), 13);
  }
};

shift_jis.reg = { test: (c) => UNICODE_MAPPING.has(c.charCodeAt(0)) };
shift_jis.est = (value, version) =>
  4 + (version < 10 ? 8 : version < 27 ? 10 : 12) + value.length * 13;

// There is no easy way to convert Unicode to Shift_JIS in the browser,
// so we have to store a full mapping table.
// This was generated using jis-gen.mjs: it compresses iconv-lite's
// Shift_JIS mapping for the range supported by QR codes.
const UNICODE_MAPPING_COMPRESSED =
  "$m#{ #1 *#n #` %#/ $$~ C#a B#c *8(6!2 $(G!( *(V!2 $(g!( Z)A 1);!' )B!; )k!' )r!) ){!3 $)q p5#@ '#? %#H! %#J! %$|! &#G #F ,$x $#o! *$- %2#q 509 -0; ,$w W/g!+ I$0! $/ $2 a$R $$S N$T $$d $U &$e $? %$@ (0K +$j %$l #j 0O $a '#D $$O! $F $E $n! $0J (#k $m *$k 7$g 0#e $f '#h! %$h! 9$C! %$A! @$b <0P u$c &\\/S!5 $S*> *I *? *J +*@ %*K *A %*L *C %*N *B %*M *D *Y %*T %*O *F *[ %*V %*Q *E %*U *Z %*P *G %*W *\\ %*R *H %*X %*] +*S w$( $' 3$* $) +$, $+ +$& $% &#~ %$$ $# B%' 8#} #| \\#m $#l J${ %$z $$y =[##!$ #9 $#;!$ #T!+ $. $3 #N! *07 $08 D&.!t *#-! #7! %'3!` 's!8 '#( #> #5! &A0A! )0C $10<!& }/x ,/| )/s &/v ,/t /~ %/} /w &0# -/y '0% 0/r 0$ %/u &/z (/{ F05 0F 0E 0D 20)! /0&!$ %0, E0+ +0: ku3M GM $?H &Oo B# >> A~ 5% $M> Q9 $T' 3q %6] T( CE VO 8L N' 'B$ %R; 'N/ &T) %G9 &T* 9s &T+ $7N F^ $?x T, %T- %T. Js $8M (Ju $J@ ;D O% (nW T/ B% T0 4z &9^ ;q P^ %ZC 1Qk $JZ -6r $8+ $T1 %T2 R8 $Q7 E3 T4 ?) JP $T7 %4$ ;` $;_ 3G %SM SL $=< 2^ $T8!$ O& T; $;s 3H Oe $8s %8t! H7 R9 $T< %T= %T> &Bk (@P Bl TC $TA $TB 8N %=, 5Y $T@ T? Mr '>T >S Eg TD M? D, &#: TE TG &F2 R^ 3+ *TF 5' $9= $G: &:n TH &Jb (7\\ *TI 3, %;a 7] Me Ks 8O +5Z $Tl Hw 4KO TK &K} $R_ $BK $>U $?* 5) (H& %FP TO (3- H8 @Q == Pz $Ew $5( $TN $Q8 TJ TL =w TM Y> -TU (TX TV %5+ $N( TP 'TT ;t %>V &6s %TY $TQ %R` $?+ $TR $TW 'TZ $TS %8v $3. %8w 5* ,Y? $Ol MY ;u (BM R4 +NE %:6 EN 5M (@i &T^ $Tc Ta %T\\ %EX T_ $Tb T` $NJ $T] $BL $Of Td! +@: Tr &K2 $L| Tm $N] $4{ &Tq )Tk Tt %Dx $;E $K> $e0 $Ts I7 $Th $;w %;v Tf '?k $Tn $N\\ F{ Tj :p $Tg To Ti RN Tp SC +9_ %:o ,Tu &Tv Tz 3/ (N= Ty 'Tx T| &T{ $H9 +:q )T} (?V $EO H: 9o $T~ '8, %U# 'U% *O' &:e )>? L\\ U$ 4=N Q= 'U' U- U& =M $A8 ):7 &U. %9H &U+! %Ih $EG $8x &O? U/ &R: &U0 'U3 $U1 $Dt (U2 U4 )U6 &U5 $N5 '8- U8! $4t 'U7 +@) $U< U; U: $T[ $U= 'A9 $U> +P{ *PN 'U@ %U? UB UA %UC! 3U $;6 :9 @R GN 8y D- ;x $<u UF P= H| $?, $UE $UG (I8 $6d (UH %J[ %DZ UJ! Km ;y S= UL %8{ &N) E_ 9j Hk &:r &UM $UN %J? 4E %UQ >* $UP =O $UR ko US O3 UT $UU! B& $?] )6t $UY $UW P2 UX $MD UZ!$ I9 &U` U^! U] =l Ua P_ Ra (Ub )CI Uc @p %Ud $GO R< I; +VR 'Ue y^ 9> %Uf OP 'A# FI $Uh JA %Ui %Uk 5x &Ul 8| $J) 4a @f %Kb Um $I< %Bm Un $Mu C{ 6o $6v Uo %Uq %:8 %Up %Rp (A$ )K~ N9 $Ur $Qs Us &Ut $IY %Uu %CJ >+ :s Uv >W <v *H; Ux %EP %=x Uy! DV $Uw 'U| $O( '<k %U{ ':t =g KP &V# U} 'Mf B' V* 6S V$ U~ Du *V& $V% &62 &:_ V+ R* &V' &V, V) $V( )RL &;z 5, %Rq (A0 I2 <l V/! &Rb %S- V2 &;{ %V1 $5y %V3 $OH $Gm $P| $NF &V4 'u~ %Ii $V5 6w P( &A: V6 NT V: $CK V7 9I $V8 6x -:, V; $V< %V=! ?l &;| PS $P] JT %N^ V? $V@ 'VB $VD VC 'VE 5& O> $>) VF %E# %A; 8~ $VG )L@ 'VH $VI $VJ 'VK Lj 9a 3F &Ix VL @S $D. $VN VM A< ;b VP L# %VQ &LA E] F; 8} %JK F_ $KQ $O@ $VS $D/ (:3 %VT 'VU 3n 3V 7^ $EQ 8G Ql $VX 4| %VW &9# %VY $Pf 4VZ $RO $;} ';7 V[ 'V] V\\ $B} 3{ &4D V^ $V_ %;8 %V` '8e )>@ Va 'Og => 8P P} Dv L$ @2 (@] $?y @* $A1 $L% &Vd $4) Dw ;~ ;F 9` %Vh FO FK 9$ A= Vi Vg 5- F3 ?I >Y 3h %6_ <m >X $Vj )Vk $8? 64 &<n 8> H4 3g Ij P3 <' Qt H} <# ,:- $Vt $9\\ O< (LB %Vs $7O Vn! Vq *Vr $8Q C$ $Mv Vp Vl ;d $Vm $S& &N_ $H= ;c <w &Vu %J: 0Vy +@3 $@+ (V| Vz $Ot $Vw W$ V{ &V~ ;G P4 %W# &W% $W' '=y SD $Vx Vv W& $V} 2W) $W5 W+ %W/ %W3 W, %WP %=r 5{ 'W* &W7 3W W6 $2b M4 W4 $W- %W( W. =Q 1W8 +3X WA %W9! $A> O\\ &W? W> &He *W@ %W= )3v $=? BN *W; I= &W< $2_ :WF Py $A@ $WL 'WK WB 'El $WC &F< WH A? (WE %PY &:: %WI! 'WG WM (WD :WS WX $WT $WO %WY DW %W[ $<( WQ GP /WU WN 6z $7_ 6T WV WR *:u W\\ WZ Dy 8@ 9% $WW $9m (4* 0W` W^ $X< /Wc (W] $Wa %W_ &>Z Wb 5We $Wj &Wh Wg *F` %5. -Wd $Wf AA 3u %Wi 05G (Wu $B9 Wp $Wn $Wo $Wq ,4# ,D_ $Wk $Wl -6i +Wt &7` $Ww Ws Wv *Mw &J2 $Ky (Wy (Wx 63 %Wz 'W} 'W| .W{ $Jw %W~ +X# (X% $X$ (X' &X* X( X& X) 'X+ (X, %X- $X. &X/ UO $@1 >[ %5\\ $3Y %Fr -X0 $=- $30 B| (X1 ;H %<x $X3 X2 %NM X4 &X6 X5 $X7 $X8 $:v %4G X9 %X; $X: &X= %I4 )X> 2r =h ':; %F} )X?! %XB 'XC $=m '9J %O) &XA XD =J <) 2XH %=. $Fa %XE H/ 7XI %C% (XG XJ $:= *XK /XL $<* 6. XN (XO (XP %XM /XF %XQ %XR 'OW %B( &XT! XS $XW (Jv %3I M@ %XX 3B: %?J $K? 7a $=t &OK $Ik %:w Ex &XV XY ,Em &XZ &X[ &X] %H> (6{ 'yZ 4H N` %B) H~ '=o %Xc %N* RZ +5] X_ (D` Xb $I> %I# I? Kz G~ &=R &X^ )4] $Hl 'X` $X\\ %Bn &Xd '@d '9& $Xe 0NU &EH 'Gw %Xg +OA %Xh %Xm 'Mx 'Xl Xf Xi Xk %=/ %N6 &Xn $Fs %5^ $B* 'Xp $Xo $<o $Xq Xs Xr %Xu $Xj Xw 'Xv Xt (>\\ Bo $Dz Xx C] 3N KG 'H0 $Xz Xy X{!$ 'X~ )N> Y# '5/ Y$ 'Q6 5z $VV @^ Eh Y% P` (P) %Y' $F4 $Hm Ei MA Y(! 4b %?K Y* '31 Y+ (Y, (4I %7b J= Na 'Y0 D{ Y/ :> %OM Y. $I@ Y2 $Y1 (Y4 $Y3 %4c $Y5 AB Y7 FS $Y6 $M| 'A2 I5 &Y; '<+ &Y< J_ LC PF (Jc %YE (8. %Q? %P$ $ZI $Y= (Y@ $En %O* &I$ (YA )OX $=S %AC *YB %>^ $>] '2v ;I $CL 32 'YF! $YD +3z 6| $YC $P: Lw -2e '3Z &>_ $33 $2` (YL *YJ )P1 $YM $YK %YI BO 'YH &NG (;e (YQ! (AD &YN S. 'K. %YP 3=0 *YS &MB &YT $YO 5P0 5K@ *YU Lx CYV YZ YW %50 YY )?L $YX :x &Yf (Y_ Y\\ ,G7 $Y[ %Y] %Y^ 3Y`! 07c $Yc Yb ,Yd .B+ *Yg $H1 &4+ $Ye &Yh *Yi $Yl %Yj $Yk ->` Ym %<, Yn $?- Ea $Yo! >h <- $PG &7z ;J Yq 6F %Yr $Eb 'Ys Z@ $Yt $Yu %Yv $Yx (Yy %Y{ $F= $3i ?z 3# $D} 6} ?F $<. (IA $@7 6~ G; H? 2u 8/ Nb $?S %8H D0 ?M P~ Y| *8R $=T %5| 4J AE 51 $Y} Q@ (@_ %?u Y~ 7d J/ Oz Z# $Z$ %MC &Z& $6u 9p Z% )7# $BP Z* >/ $52 Z) $Z' Z+ Z( Ji a& BQ $Z, %R= $Z- %Z/ $GQ Z. $CD $?. &Ey @, $M` D1 $?^ Z0 AF Z1! 34 Ec Bp $Z3 Il AG $AH $Z4 %D2 &AI (Z5 $Z6 $PU &Z7 '9? &@8 )Z8! ?m BJ JQ Br L] J` 9B Z: &8f Z; $9w $J, 4u $>a Z< Z? Z> 9v $Z= $Hn +EY $I% ?Y %D~ Qu )ZA $ZB J3 $>A 'ZD %ZE 5ZF &7e ZG %ZH /4q )Da 7U $ZJ Oy 'E{ $6G %ZL ZN 7P %ZK ZM $ZP )ZO $ZQ 4ZR )Iv 9' )5N ZS ZX %ZV $Nd Nc (IB &ZU @j $ZT ,C5 &ZY %=s %Z_ %Z` ZZ 5} Z[ Zd Zc Zb Z^ &Z] %Za )Ne DZh Ze $Zg $Qm $Zf ,Z\\ /C6 %Zi %=@ &Zj %Zk .Zn $Zm %Zl &IC ZW &Zt /Zp 'Zo ,Zq $Zr +Zu %Rc $Zv Zs .Zw %7Q Zx 'Zz Zy %Z{ 'Z| $D3 @9 %@{ $E. $</ =A <0 8g %Z} %=B %;K Z~ Ow K% [# $<1 &6y $FU 9K &>b ME %L& '[$ 7f '[' 'GR %[& [% [( $H@ *C& (>c $Ck $E| 7t %GS %[)! B, 'O+ %[- %[, [+ Mh $[4 'OL $[. ([0 O^ $[/ *[1 $Ki [2 N+ [3 07$ N, Jm [5! $<2 7% [7 ;9 Q> Q# 7g [9 $GT $<3 AJ %LD %AK 'A3 (HA Nf Ho %<4 $MF &[: (I3 =K &;L $HB *3$ A) <5 QA +[;! K3 '[= Rt S/ '[? [> %65 %[C &[F! $[E $M* AL [I [H [D '[J! %[L &[O [M $[N [P $4K HC [Q $:y 5_ Jt $[R JX $NH $[S S0 '[T N- [W T& T6 $?A JR [X $8S GU 3[ [Y Mo <6 %F~ &HD (Pd ;: ;M $[Z &[[ $[a $?v &GV $9( [\\ &Lq $Ft %[] )[^ $9) $[_ $[` %[b $IQ %[c! $[e %[V [U &[f :? &Lm %=U L} GW M5 [g %AM 4, $[h &[i $Pg %LE %[l 4d CM [k [j :@ E} $[p [n $[m R$ ;f &A4 [o I& @T &Iy [s [r '[q $[t ;g )[u Mg @q %[v L^ 'Iz GX 'Hf %[w 7} (BR $Lr )7h Jd +[x >d O,! %4e [} %G< &[z )5` '\\R [| &Jn %[{ %[y $=% $\\# 1\\* \\0 \\( $I6 %\\- MG %\\' $\\, Rd >e %E~ \\$ &8T \\/ CN 4L \\) 5a \\. &9* $\\+ +\\1 )\\3 \\= \\; %\\8 &\\7 Ru $\\9 %9+ $<7 %A5 &\\@ \\2 '\\6 \\% $5c \\: \\< G# %=1 4} \\4 \\? \\> 9, $ER 6U ':A $\\5 ,\\A $\\D \\F '?N $\\L HE \\B '\\J $5b $\\H! %\\E \\G &;h Q$ %7& %4? \\K $Jx 2j *LF [~ \\Q \\U PZ $\\N &ID \\S *B- \\T J4 ,SI $\\P '\\V $=& $Cl %35 \\O \\M $E$ &\\C >B *Eo \\b $E% \\] $\\Z! $?w \\^ \\a '\\\\ @; $\\_ %\\Y $Pq Pp &\\c! 36 (\\X '9k 2c &7' $\\` (\\h \\g &\\l *\\m *\\k \\n \\f \\j %\\o $\\p %\\e ?/ $\\i F# <8 \\W BS '\\} $NV %\\s!$ %\\| $\\{ %Op 7( $\\y $:C 5~ %\\v %R5 \\x 37 \\z $\\q \\w \\~ :B \\r )QW &Q% ']% %]) &EI $Rv ]* %]' $]$ %]# ]( ,My %Im $:D $]+ ]& $], &:z &4v &]4 &7) ']2 %]3 =2 ]1 ]/ ]. ]5 ]- ]7 %5d 5]9 %]8 .GY $]< $]: ]0 :{ $]; $]? ]> ]@ ]= ]A *]B! NW $]E ]D @U $CO 5O 5e $]F $2| &Cm ]G $q\\ ]K :` $]L 'D4 &]M &]N 80 ]O $]P! F$ &;N %PV &O. A% ]R (D5 s^ LG $?{ $=V ]S 'Ep $Mp %F> %]V %]T $]W %]U ']X (Mz %2t 'MH %LH %]Y $]\\ AN 81 $]Z ]a AO '][ K& )QX ]]! ]b IE ]_ <9 D# %]p Ku $F? /LI ^Z 'Ng &HF &Oh $]e 4f G= ']n %Fb ]h ]o ]j ]q ]m $]l KR $]f 5f ]d 8h F@ ]` %]c <: C| $AP ]k K4 %8i 66 -6V B? ]s ]x $]t $:| $]y >0 <p )@< ]g $?0 ]v '>f ]w 3% %]r 'GZ *8j (9- *]u 2d %=L &BT -HG %L9 ]{ E( ,ES %>9 ]| $]~ ]z 'NN $Gn 'E& -Nh ?_ ^/ $^- %C; &:} &^' AR %JE Jo '^% %E' '@- ^* %AQ $^$ ^) %K5 &^# $9{ %6K &^+ R( =W Fc ^( $C} $<; C' 4M Db ^& 8; (:E $H$ ^, (E) %^0 $^2 %E` ^8 $^3 %^5 (M+ HH $^6 &Q& &QB 7* (2k $^4 (^1 '7i (4N $^7 &QC .^; )Ed $^B &^< %^9 ^@ ']} ,^= $^A &L' IF )^: $^> &:F &=z &C~ .^F ,H\\ 1^C $OS (^D )^E $PC $CC +:a '^L ,>C ^I $^H 'Jp &In (Hg ^J &^K $MZ $K' >1 $D6 $OB )67 $^R ^M 'QD ^T %^P $^Q (E+ '^O $]i &^S $^N (^X! H] ^[ %>2 ^V '82 %^\\ $^U ^` $^_ $^^ &^a %^c B. $^b '^f 5^d &^e ^? (^h ^g (^G ^i ^] %>g '^j! ^m ^l ^n 5g $<< %Ni CP (;O %^p '^s $M< $8U &^r ^q K6 ^t 9. &^v ^u &7+ >D %J5 (:G &C7 $^w $CQ H^ $MI ^x ,^y! &N% Yw Cg %M6 $=a $LJ L( (I' $R> $^| ?a %^} $2s %9M Cn $MK &^~ >P Fu $>i BU )_# $Nj %4^ >j &_& $_$ _' R6 _% 'D@ _( %E[ %_) '7k $_+ $_* '_,! 7l %JY Fd 8c >k E, %@r 2m &_. +4g _2 )<= _1 %=4 AS %_0 $AT $P5 =3 &38 Co *_7 %CR 4- '@k $OY ={ 'AU $CH '_6 _4! (G> %_X $_; ?1 <> _9 '_: $BV &_8 %>= -_= _< _A %_B $_> $5l _?! L: 'ML :H _C &CS $AV &G$ )9@ $_D _H %54 _E _G '_F %A& 'Fv 3& _I '_J 'G[ &Rn '>Q %NX (O/ &_T _L %_O $_N %_K %_S %J; $_M /_U %A' _V $QE K[ %_W (_Y %_Z )_[ $9C 4. <? _\\ $_] A, E- %Ve Dd Dc F% =P %Tw ':m Q' $Nk $Mi $_^ '=| Gp __ S1 &O0 $G\\ _` 7m )_a! PO $Ou Oi ON >3 _d %?| %OC $_f _i _h $7j %8W $_e $_g '_j %C< 'Qv 3* =i Ee $?n %B0 %_m %I( $_k ET _l B/ PR _n! Qc '_t %<@ $K7 _q IG _/ _3 $8E $K) '_s $AW L) (_y $L_ $_p $_v _u &Cp 'O` $RP %OZ $55 >l %SJ _x C8 &_w %_r (;P &_~ _| $56 _z `$ `* *Eq %N. $`, &Lh &`+ KS O1 7, $D< @V &H( $Q( %`' `& &`( $`% %`- $`# %_} $`) _{ $G? $Pm ?W =} (=C %Ob 6/ %H# J' 4/ 1D7 %CU :( )`/ %<A 6k )`1 6c `8 )`4 $D8 &69 =5 %68 =X %`2 :d :I IH %`0 $3' '`3 `5 $9F :* $7- 8A '`9 %>& Od $>E &`: &Lv /`F $4x `; )`L `< $R? $`C $KA *`K $`> &2q `@ %<B &`B $`A $`= `H $AX &Y& ;i Qw '`? $HI 5m =6 $`7 $`G 6P %`E `I $II *7o $`g %P> `N 7n $`U 'O2 $`V `X $`\\ `P $FX 'IJ `` `S $`] &`W )BW `a %CT )`_ 7. (SR `M %`[ 39 %`O %P/ `T B@ Gx `J %`Z )C= `d 6` :~ '`f `Q `e $`^ `R $`b $`c (`t &J+ $`Y %`p &`r $H- -QF +Ma `m Es &`s De $`j `w `v $JL `u JG *`y `l $9A `o @s &KC `q 9D $`i `k `h %S2 6H `n %`x 6# *=p &4C %a- %S3 a0 (BX a/ &a. )a+ )`{ %a< `z $a1 )a) %a$ `} $`~ $a* &y[ %a' <C Gy E/ a% $`| %a# 'QG O] &a( a2 +a: a3 %a@ $a> 'a9 )a8 $H% $E0 $a6 %a4 %a; 'aA LZ aG (aB aE a? %GG $L~ $a5 %a= AY $PD aQ aD (;# 4h 6M %a, )AZ aI $aP @. 6a %F\\ )aF %aK aO %9/ /8B aM (7s $J( aL &aN .aH (aJ )6O Fw &aU +aS ;j $aR )a[ '`. &aT $aV! )af $ab $`D 'aa 'a` %a] (aC a_ a^ 0ad $S( )ag 9t %ac ae +Kh $ah 2al ai +Qn aj 'a7 *am &an )3w $ap :f ?2 $9N &4i -QY 'ar aq at 83 %9O 7/ 'aw &av $ax %57 $Fe $ay %70 a{ 'az $a| &a} $a~ >m CV =* $M[ %NO SF '?( &=Y Ro &b#! $>o &b%! %b( b' $OJ %@t ?} >R $b) *b+ BA $b* (b, (b- (b.! &b0 $b2 b1 b3 4j Fx $b4 %>4 6: b5 %Hx Xa '7u b6 'b7 $NY O[ &J$ b8 LK &L` %PH &b9 .b; b: %b= &b< 7b@ )>p $P& $bA! %7v &bC *bE bD 2C( %M# 40 (L* $HJ @W 8X .L+ $?? 'bG $71 %4_ %JO bF <D G% $bH (bP $bI (Ej $8Y bQ ):g %7w bO %bM bJ Q[ 'Gq &J6 bK %bS $bR 9} %4r %=D bL bN (OI FA +Oj %b[ %b\\ $58 'Mq Pr b^ ?4 A[ bW b] 4O $90 %bT bY &D9 KT $LL )bV $No $bX $ba $b_ $bZ &Np K* 8Z $H[ %G@ $bb 'b` F& bU $41 :QH bm (bl 'D; $bi $Qg %Io bc (Gv &42 <E bf )@= bk $bj be $bh %6W $bg K+ %R+ %B1 D: 6bs bq $M7 )bn bp $3| %<F S4 $6+ $MM (Q\\ %5n BY br .bw %A\\ &Q* $bt 'bo $bu &R[ $IN I{ 56$ %4; %b{ %b~ &R@ &Q_ 'c) c# b| &RQ c& '@` c( %c- %IL c+ 'c% %Ff %c, $b} $c' $c. 3] c$ $c/ %BZ $@u $Mn $=7 $bx c* Hp ,CW $6X =Z A] bz @X *:J $by &c3 A( ;; $cB $c< 8k I) $c7 c@ 2l 3t %4~ $c9 EU c0 c2 <G +cC $c> &c6 'c= )O| %c; c? *;Q $A^ %Fg &c5 *Q) &c8 %c1 IM %c4 &c: *SS ?O Oq $cD ,Ko %cP ;< (@w $cF &R, <H $cS %3O %cQ 'cE 'cK %cM &QI cH %Hd %cJ 'cR $cL P< &cG $?3 c_ '6Y $cI cN! *F9 F' 0cW %c] %c[ $H_ %ce cX (cY cA $8p M$ &?P %<~ (S5 $cU $cd 4P E1 -K\\ $72 Rw *Or H' 'c\\ c^ (DX (cc cZ $cT &74 1:h &cq %cl D= %6R '@x $cu )cn G] ck H. &d2 &ch $cg $cp &cj ci co $CB $cf *cr %cs (73 ,cx $cw cy (c| )Hy $cv (cz ):b FF ct Jy %c{ 0d$ c~ %d% %d( &c} <q Jf %bv )Qo d# $d' FB $d& $cm %u4 &d+ &d/ %d- *d) $d* &d. $d, &M8 %d4 $d1 d0 $d3 J1 d5 )GH F: 'CF &d6 $d8 .d7 0cV 'd9 )JD -d: *59 &IO 5o *8[ &?o =[ .S) C) &4Q &d< )d; 5d? Fh dB d= &dA 'd@ Hv 3: 0Rr %dD &3j ,dG &dE $dC 4d> *Nq &dI .dH -4R 'dK M{ $dJ 'P* 'A` 2DY (A_ /Rx %dQ $D> )dM dR %4S +dP $KD dL dO Aa $L6 %dS $?b 1D? )dV &dN $:% 'dT 'QJ dW &y_ (@e +dX &dY 'Jl *d[ 'd\\ 'Jq 'IP d^ 'd` $RR $d] $d_ 4T $dZ *Wm da 'E2 >F dc 'db BB Vf )dd &df $dU de %dg )K] )dh %di -dj /dk $H3 $dm dl %dn $do %?p MN &Pa dp! D| ?5 dr! (dt N? L, %du K9 (G^ (dv 5P $8d $P; $P+ $4y S6 'OD $Ms +CX $dw 'I| &;$ dx $=] dz dy 'd{ -d| &d} ,84 $d~ 'e# ';% %L- %e% &B2 %e$ +91 e& e( $e' *e) $;R $e* '9b $Df $=( 'e,! e+ )?~ %J% 92 ,e/ FZ e. %S7 KE /e2 .e4 e1 &PI e3 e5 $RA (e9 &e8 GI Jk %;& e7 'e6 $Q+! )e: 4U '<} >q +e;! *e> .@Y 'e@ $e? (eA $6; %eC %eB $eE eD +;= %R% $9E $4k -9c 57R +Re eG *eI 'eJ $5: (eF $>G %Gr eH 2eM $@# 'eK ':< %L. eL %eg )eR (;> '8\\ $eO Qx %R- ;FC %eQ /eS RS 9P La K, &eT 'eV $eY 6eU &eX ;k 43 eZ $C3 eW RY %e] y] 'e[ e^ 'eP e\\ %=E %e_ *e` 'Qy *ea 5eb &eN 'ec +75 /?6 /ed 'ee 'ef *3} &ek $M% el %6q em $en 'eo $eq! ep &M= et es -ev eu ew )ex ez ey %=$ $e| $e{ %76 $Bq $Hr $e} CY &>H $4` e~ $QK %NP f# &Hz Q- <I B[ &Fy VA $G_ 5Q f$ *f% $f* %f( f' ^o 5p f& $3; $Kk %L/ 'R. f+ f) G. CG %Kl $Ls $f- R) :K f. $f, L; f/ $f0 %3< %B3 f5 $f2 JJ f1 )7x %f8 &f3! $f7 f6 Lk %Dh Dg $85 %f9 (f: %f; (f= $f< (4< (fE LM f? $fA %fC B\\ %fD fB ?Q &f> f@ $M, $Ab %fG %fF 'fH $?7 =8 %IR fI $G| %fK &Qz fJ (E4 )fQ $fS! G& (fR $fO $fL! $fP *fW $fU $fV 4fX fZ!$ $f] %fY +f_ &f^ )f` )RB &fc fa! &7S (Ps &N7 $fe &fd 'ff! 'fk fh!$ $fl &fm $fn &fo $fp $Kp I* fq KU Lz $fr %fs H` $5q <J ft %fu %fv $>7 %fx %fw %fy! 6LN $f{ &f| %yD f}!$ '>< %g$ K8 %OQ $44 $4= %g% 'g' &g& IK &CZ as $g( P6 $g) $77 L< g* $g+ %g, &PQ &PJ $Go &E5 %g. %@y %Ac %g1 %g0 g/ Lb $78 ;* 1g7 %g4 B] P' &g3 g5! %g2 0g8! $G` $7T &G8 )g: 5g; g> (C* $I} $g? OE $g< %g= 0gB 'gA g@ .gD %gC %gE /gG $gF 'N: )@l RC %gH %Ip %gI %gJ $gN gL! $gK *gO (gP ,gQ %gR P, gS (Pe gT $F| $KM $9d &Fi gU 93 &Cq +gV (=F ,gW (gX $;' =^ -gZ 'I0 =_ 8D -Nr $K- (I1 '<b (g\\ :Ad 0R/ <K %;( %Kd $g^ *g` ';l 'g_ HK 'gb 6% g] %LO $3r $=u $ST %ga +gc &N8 $Cz ge 'gf (gd '6< $gl $gk %?8 &gm gh &gn gi 'L= gg %gj (gt /gs OT &go %3L 'gv +gu &Ae (gw )Di %gy gx )gz /gY &g[ g| g{ 0?9 $Rf $?c $g} :5 (86 7y >r )Q. %h' $h& Dj h# %h% %@a B^ h$ g~ $Jh %Af %M& '=` ,IS %h( 'h) h? 9Q %S? D[ 'h* %5; HL Mj 0h+ +8q h, %h. &h/ $Jg %h0 (h1! %9R 5< I~ @> >s *h3 $@? (53 M- %h4 %LP )Dk $h7 $h8 KL $B_ h5 $G4 %h6 &Ag -3= '7{ *h9 %HM $h: Ch (O~ %Li h;! G' $RD %h> h= 0@$ %h@ 3Q 'hC &hA 5= :L hB <L <y $NS hD %OF %hF &Cr 45 5# 2i )hE ,hG! B4 (hI $6= 'hK &:i $8] %hL 9n %hM $DA $J* $D% =~ &hN ,G5 E6 $hP hR hO hQ )9| ,hS :$ &8^ QL hU (hW &3p 'hZ &6e hY hX $h\\ hT $h] R& $h^ $h_ %Y- ha $h` &hb! $R2 hd $v< Ah he! @m $Iq hg &FV %hh $Fj hi (8z $UI G/ ?D '79 %hj $hw $hm $8_ $hl hy &hk $Ai )ho! $Ha %hq $6L 'Bx MO $hs &F5 )hn $hr ht %>( .h{ Lt $Kg IT $9S hz hx $Kv hu G0 IV $IU $># )i1 *h} $i# 'i& $i' $i$! %h~ h| 'hv .N< 5> &i. $i+ $i0 %i/ $KV Ox $>I i) i2 i- $i, i( $i* $7: +Fk %DB &Kc %i7 &Ke *D& i4 %L4 $i8 N@ $G- $i3 i5 %i6 0i9 %?U &J# i> i= %i: &S8 (iC %iG iD +i@ )iA (iF &i; Vb iB i< %iE *iK $7; $iH &iI %iJ iM .iL L[ 'iN Ry NZ iS %iP +iO Cs $iR iT &iQ $iX $iU )iV i? &iW iY )iZ )N3 $i[ +PW %9G :' i\\ (M} $C+ $P% %i] $R0 %KW $Dl Jr %@c &2} $ib i` $i^ 6n $Aj ic %ia $i_ ig %if ie id (ih &ii C[ $ij $il %ik ';S &D^ &in &IW $im &io $M~ E7 <M $ip 'RE *ir %is $it $iu $>t $iv :M %8a $7| $i{ $Ph <N iw &i~ P[ $Jz %Ly &@z i} $?d <O >u 8` N# i| &Dm O4 >$ +>v H2 $j% R\\ =b $j& B` $j( &Ak =9 'j' %@@ ;? Dn j# j) 'j$ :N $j, j0 :j (j+ 'j4 %<P %Qh 2y j1 %8b $j. (j/ %IX j- j* $5r D) %;) &j6 .j3 (j5 &j2 (:O E\\ j7 E9 %jD %j@ j: *j> @/ 3> j9 jA jE <Q PK $H+ j; %jC $j8 Fl $j= 2z P? *j< %9T LQ &E8 $RM A* %jm %jF $DC $jB jG jI $HN jL %jH &NA 7< %P@ %3? %jK $Rz )jJ (4V %JI jM &jT jN jU )jQ +K^ %?[ jS $jP jV jO %@Z 'Ns %@b %jR j_ %jZ $j] $j[ j` jY $j? Ct %L0 $j\\ %jW &DG :P $@A )BC D\\ jc %je! %jb jd *jX ja $ji jh %Om %:) +jg $jk jj jn $jp %>J jl 'jq! %js $jy Hq ju $jt jv! $jx 'jz! $`7= $j| $j} -j~ )k#!$ $k&! %k) k( %k* )k+! )k/ k-! =j :Q %G( $Kt $A+ %K/ $LR k0 ]6 +k1 k3 $Q` k2 k5 k4 $QM $k6 $Lc (k7 (k: %k9 k8 'k; :0 &DH 87 'k? k< %k= &k@ $kA k> &3k &4l &kC! &kE $Q] (@B $kG kF -C, kH 'kI %kJ $7V '7> %kK (kL $OO Q^ &QN S9 $<S kO ?e kN 'kP ?: &Ez $kQ %<R $PL kR! %kT 'kU )kV -?; %Pb 'kX $Fm $kW )kZ &kY *k[ &C\\ $k\\ $k] &N& k^ $E: k_ (k` )R{ kc $kb ka Ga $kd BD $ke &kf S: kg 'kh kj ki Kf $JV $S@ Kj )kl %Al $Lp $km kk $7? &;U >w %LS &;+ O5 $kp kn $<T $<U 3J $=q (K; +3@ ku $Fn (K: $F( *kw %ks kv kq $kt Nt %;V %3^ kr ,ky $kz %Ir &94 &l, J{ '>x %95 Ci SH P# kx Cu 28I k{ *k} (k| (k~ $FT $J| (Gb 'l) *l( 'l# %Bs $MP l+ $l* <V SU ,l; (l/! '@% %l. $=# l- %l1 &Gc Mk DI 'F) l5 $l6 l2 'l3 $l4 '<W &l< $l8 'MQ $O_ Ln %l7 %l: l9 &O6 l= )l> %D] $l? %lA $lE %lB l@ J} lC $lD &4w $lK lF &lG &lH $EJ 'lJ lI lL 'lM! %Ba $5R $lO RT $?< %@C (>y G) (lP! 3s $lR %lS! %lU $lV 96 ^W lW $D* lX ?\\ $lY $T5 &lZ NK 7M %DJ @n $M\\ @D ,l[ <X l\\ L1 $lk 'l^ $Er KX ;@ l] DK )l_ )HO 3la l` lc %lb $ld %lg $le $7@ $lh $li! %=: RF $ll BE &4W lm! (lo /3S $lp 'lq )MR &?X $ls (5s 2o 'lr lu K0 $Bb $5? $Nu ':[ 9U $lt $5S *6p .4X ly Rg F* %M. $m) $5@ m' $m% lx $lv $lw $?t 9e GJ &J. (47 $l{ lz 'm$ l| m# )PE l~ 5A 6l m& %m( ':R *m, m5! &2h )m= '3R %m4 &m3 $m. m- $m+ m* G6 $FH m0 )m/ 'm2 &E; :S '4' m1 $<Y (E< =mC $mD $5B &4s mA +m7 $m? $mF m@ &m> 'l} %m< &m8 &7A m: mE $m; (mG $m9 K_ (Qd &mB *mX &mP &C> '8< $9V $mK '5D %Am $mN &=c %I+ mS +N[ $mJ &5C ;W Lo mT $mH %mQ &m[ $mL (mM Is %mR &mO Nv mU 3A 'mI /mW $mV )KN m] $mh '6m &mk %mY &m^ Qi +mg %QO 'R' +GK &6Z (M] mm IZ %2n %mf $mb E= m\\ md mi $Jj &2g $ma $mj Mc *me $m` )An '@E &?= 'PM %M1 %mp $my .mc '6f (B5 mn $ms E> %mo $mv %G1 $mw %QP ml 6& $mr %mu O} 'mx %mq mt 4Nw $S# (m| *n' %m{ ?T (mZ -N; $Os n& n% $m}! $3x 'n$ $mz 'H* (n# 3_ *EK *N0 %n( n/ $L> 'n+ Ao ?Z n1 %97 )n2 $Md n* $m_ +n) 'SQ I[ M^ %n9 ,n? )n@ $n3 &KY %n= n5 $n7 (nA n6 %n: %4Y $JB $n; n> *n4 $DL $n8 >5 Bc :. Pi $Pn A- ,nE nC )SP *nB &Qp $nD nF 'nG )nJ nH )I\\ nI &L2 n< /A. $nK nP E? %nO &n0 &nQ Do %nL nN *nM %ak a\\ %nS *nR -Qq $g- nT 1nU 0nV ;X $8J &nX Ug '8l $R7 $9l nY *nZ &GA (n[ *JW $2w 15L n`! )n\\ $>K 0n] K$ 'n^! ni &nc nf (nb 0nd $ne ?i $ng $Fo $:T 60 (nj '6- $np %nk no 'K{ 'nl %nm M2 L? nq +FJ n{ $nw %5T $nu $Nx nv %ns $nt ny n| %nz &nx nr (G* $o' $O{ +o% &o& -n} %o# &o$ &n~ ,D+ $S; o+ $o, 'o2 $BH $o. $o1 (o) o( %o3 %5E $o/ $o4 &o0 (o- $Gd $o* )KK %o8 -Q5 4o7 %o6 +o? &o9 &oA )Qa oD $o; %o< &o@ $oC oB &o: 'o= $oN 0oG 1oE %oF &oK! $5t $88 %oJ )o5 *oI oM oH $oO &oQ oP -oS oR nh &oW ,oT 'oU %oV $oX ':k $oZ $oY $@F (<Z bd 'o[ @g &6' $o\\ $48 $Ap o] %<[ o^ 3B 'M' %o_ 'C- $of %oc $GB (od oa 9W $o` og (:4 %F+ $om 'oi &E^ oh $ok 'ob &ol $on )LT %oj $oo oq %;T oe $2~ *op $=d Rs or! E@ ,Q{ 'ot Q/ %ou! %NQ ow $=I $Q| )o| ,o} Aq o{ &Qb ox %oz C^ CA &oy $o~ %Ml %p$ $p# &6[ $Ny p% ,p1 p' )p( 'p)! -p. $p/ %p- (p+ $p& p, *p0 u` +4m *p3 9X p2 &p8 $p7 &p: %p9 $p; %@G $p< %p= )p> C_ $QQ $p? %Mm K( p@ $pA ;, &7~ &pB %>z K# pC $6> )pD 'pF Qr $pE Bd $pG %pH %pI 7B )pJ %pK $pL! 46? *pN $pO! (5[ %BF pQ /pR &pS *;A $HP pT ':U $Bt $pW $I] $pV %:/ %pU FD 8# %pX $pY $Ar &:l $pZ 'Nz %D$ &8m $Pj Dp $p[ &Be GC As 'p\\ 'p_ $p` *=G Ek p^ $At M( (p] %>{ $49 $pd :V %>} %>| $SO pc pb DM $8C SE 6( Au +pa (pf $pg pe $;Y $Q: %>~ Je &pj $Ca $Fp %Q0 $pm &;m $C` pi $pn ;n pk! $ph &D' J& %F] $5F )LU %89 %Ge %pq $po %Fz &Cb 7C pp $By %RG &SB &pr p~ Gf $p} $pz q& p{ $pw $HQ pu &ps $Pw ?# %px $pt &p| A/ $;B &FG $O7 4@ 3C $I^ %q$ 'q# $JC $q( &py $q' q) $;- q% <\\ $?f %q* QR 'q- $q0 %q. L{ )q+ (9Y 'q/ %q1 *q5 %q2 $q4 q3 )q6 $?B $q8 q7 MS %q: ):W 'q9 q; %q< 8: kB B6 $q= %;o (q> %q? %>L )^{ $q@ $qA $@H $qB! %qD %qE! $cFY %qG 'qI $qH 'I_ $qJ $N{ $qK $qL $qM 'qN 'J7 )Av qO *<r T3 qP .qQ M) qR $qZ (qS %qU &qT qV $O8 qW! (qY &q[ '5w H< $MT =k <] 'M9 5H L3 q^ 7D Cv q] qb GL PX $q`! 8$ $qc KF F, %LV Hs q_ $O9 5U qe S* Gs SG %?$ qd $EZ %qu DN %JU $M: )qh >M ?% $Aw $KH $;. qg qf $MU &?R %I, /qj! <^ qi )ql! $qo EL $qn 7W $qq $qp qr %qt qv $qw pCw $?` qx &6@ $qy %EA qz $q{ MV %8% ,q| &Gg '4A 1q} ,@& 'C9 -EV )r$ &r# &q~ +r* r( %r% )r' &r& r) $8n $r- $Cx $r. ';Z $r+! &S+ &Gh $DO )r/ %r2 +r0! QS 'I` r5 /r3! r6 -rG (r9 &r: r8 /r7 $HR %r? rC r@ r; $rA &rB 'rI &rD (Cy rF %rH rE 0rK $@I $rJ (rL 'rM %rP rO $rN %rR rQ $Pk &rT $rS rU 'rV *rX +rW Bf rY %9f rZ r\\ /r] )r^ r[ $r_ $?g r` 8& :1 ';/ +ra &JM %Ht rb *re /?E %rd rc :X rf '6A $rh &=e rg $rp (rj rl NR ri &rk $ro rm 8' $rn )rq %K< RU '@J &rr 'Px rt $rs %rw Q; %rv $6\\ ru rz %ry %rx Hh r{ +r| 'r} %<s $:# s#!$ YBg s& $?> s' &s( &V. V- 's) jo s* FR BI J~ 's+ %NB H) =) %FW %3l $Ok Bu +:\\ %9Z %NC (s, *s. %s- 5I %JS s/ KZ $Hi $s0 @h &s2 %P7 sA s4! %Gz %F- EB $Ia $s3 8K 's< $s9 sF Ib G3 s6 $HS I- s7 s; C# $KJ G} %Cc s: EW EM s8 2f S$ &s= )F. %@K Bh %s? s> $3P s@ %Lu $sH %J8 C. %G+ $9q $sG Q1 4% $ND 5J sB!% It FQ 3D sI $sJ y\\ %Ef $sK $4Z Dr $;0 $QT %sL Hb &EC ?h sM %sP %@| sN DQ DP $3E $RH sR $LW sT sS sQ h[ 7E %s1 $sV sU 'sW $Q2 4J> %N| $sX $?j 'sY $sZ &s[ %HW +3K +<_ &S< /s_ (:2 s\\ $s] &M_ '6B *Q3 $98 (I. 's` 2sa )sb 6HX %sd $sc 9J0 se @L ?q K= GD &@' $C/ $sf $sg ,B{ sh $si &sj Qj $@M (sl sk $<` $<z >N ,so '@} $sn $sm $F6 %;p $Cd 'Kq '@O (sp $Ax (ss sq &sr 'su st %B7 $sv (sw! 'L5 =\\ ?r sy $sz Q} @[ Pc RI s{ 9[ 's| $HY %t# 6g Bi $s} $s~ $H5 %OG 9u 0t%! (t$ %t( 0J< 61 %t, %t) t+ +t' -tu %t* *Rh %;[ *t4 'Hj t/ %t2 t0 $t5 't6 )t. %t; 4[ %t- &Kn $t1 $Ay -<a /O: $9] %@\\ $Iu .DS $t9 $t3 t8 $P8 $Gi t: t7 3DR ,t> $t= 8t< %N} 4A6 't? NL %4: 'M0 GE '8o $tA $<c ,>: +t@ C0 *C1 tG tI (B8 $tH tJ %9L $M/ %?s S% $tC >% %SA %tL 'tK tM +tB )JF $I/ )H, $tR 'Fq tN &tO .:+ $tQ );1 )tP $Az 06h *tV $=H ED %G{ /6) 'tT! Gt $tS +tW ,t] 't` *t_ Hc 'tX! t\\ 't^ &99 %ta t[ %tZ =te &tf +tg %td tc &A{ Ic tb )tk ,ti ,tj th $FE $tl )tm %to /7F tn Po )tz tp %ts $tq $tr *tt (tv 'tw $tx 't{ ty t| t~ $t} %`Gj +P\\ $u# DT &u$ $N1 u% 5u &3~ $7H $7G u& $u' $u(! )u+ $7I 6C <d Kw $u- u, 'u. '4B )u1 $u0 u/ $u2 'u5 &3( %u3 $u7 u6 )u9 u8 u: $Ig &u; 'u< u> %u= YMW 'u? )u@ $=n &uA! %O; +Dq &2a Et $uC $MX )uF uD <e $uE ;C -N2 uH uJ uI uK %3c Bv A7 7J uL &KI $uN &3d $uM Gu $RJ Id uG R# $;2 %QU *9r R1 $:& $F/ l' $uO 5v C2 '6D uQ $uR uP :c $=f A| &3e %RV &uT sO $uS (uW uU! $uX $uY Ri uZ! $Cj K| &C@ 7X %Q4 5V @N ;\\ $u^ $u] ?& u_ u\\ %>6 &uc o> %Vc $C: ua (Q~ JN '3m $D( ?G 'N$ $4& &Rj Qf $ud $H{ '@0 &ue $uf Bj ug $Rk %ub ui uk $uj $uh %ul %um %EE $5K (un %P- %uo (up $S, (_c uq &ur! &uw $ut $uu $uv ux +Ce &Pl %Cf %uy $LX $uz y- PA $u{ $u| $u} 6E $v# $Bw &v$ %9~ 'v% v) $v' 'v( %6b v& v* 'v+ $3) $v,! *A} &v. &8= %v1 %v0 $v/ %q, $NI (v2! 1v4 %v5 $v6 %v7 *7K +v8 3v9 Ja &v; 5$ $v> v= '3f &9: $N4 Gk =+ $<g @~ $Bz &v@ %v? Q< 7Y L7 J9 &C? RK $:Y )vC %vB *O= Ie )46 %vD vA %M; Qe vE +vF 'vH F7 6I! vG '7Z ;3 %7[ %Hu %R] +;] &vI &vJ! vO $vQ vP VMb $vR 'vS $vT 'vU /vW vV $vX 7LY kM %BG %8( )vY $vZ $V9 au L8 %3\\ $2x *?' N~ B; 'v[ $PT &v\\ QV $4( &>O $v] 5W v^ &v_ 'va! $vd v` %vc &7L &ve $vf 1vg! &vi %vk &vj $vm vp &vl vn! %vq $9; a@( vr! <h .vt %6, &K1 vu! 'G, JH *vw 'K` %Eu 4> 9g $9h *GF v| 9i %5X %v{ %vy $vz $vx %w* -v}! %w#! (w& %w% &@o $w' &w) +8) w( %EF ;4 (w+ 1Ev %w, 'If )w- )w3 $w0 $w/ w1 $w. *w5 *w4 $w7 %9< w6 &w8 %w9 $w; w: &w< w> w= _=' 'w? %w@ *6* &wA &wB &C4 -wC $wD $wE! &<i (wG! %wI! %wK &Kr wM $Ll wN wL $wP %wO %wQ &wR -wS 4wT $wU 'wV %wW! $wY $wZ!% &w^! $ao w` +iq 8* '5k =; wb wa Ov *wd! wc $wf %OU &wg $8r 7S' 'wh 1wj -2{ %wk Mt wi %wl! *wn! *wp $Oa >; $>' DU (wq 'wt )wr (wu %;r ws 'wv $ww! $w| $>8 'F1 (w} wz wy w{ &:] *x% x$ x# %2p 1x/ $x+ $x, x( x. $x* 6Q %SN $x- x) x' x& (x1 (x4 %x3 x2 *M3 x0 3T x5 $x7 )6^ w~ 3y %x9 *x8 x6 F[ ,Oc 'RW %x: (x; )x< 1x= $x> $3Gl $x? $Kx $xD x@ &xA %O# P9 $J- /xE %xF Iw xC xB '4o &xN %xM (4\\ &xK &xJ %xH $6j $xG ?C 4n 1<j %xQ xP $xO %xL $xR $xS *x[ xZ *x\\ %3o xW! $<{ P. %xY *O$ %xa %x] *xb /x_ $x^ (:Z -xc ,xd 'xe $x` &xI %xf $H6 &xj $xk xi (xh xn $xg $xl +xm &xp (xo /xr )xs $xt %SK (xq F8 =v %xu ?xv! %xx yxy %;5 xz &x{ $?@ $x| )x} %x~! 'y& y$ S> $y% $Rl (y' $RX (y( Ka %y) y+ %y, -y* <t PB OV [8 $b? On '4p *y. 8F y/!$ $<| $y2 &e= PP $F0 y3 y5 y4 $y6 'y7 %y8 )y9 'y; $y<! $y> $y?!$ ,yB! (HZ ';^ $yE -Ds yF -yG 1Lg %yH .yI h- %qs v: %yJ $yK -yM!$ Rm yL %yP! %yS $yR (yU &yV yT 8R3 *yW )yX hJ %yY %tG#, $#w #s #v #x $#L! #y #^ #& #_ #' #A %:!+ #)! #f #d #g #+ #z %K!; #P #B #Q #2 #4 #0 %l!; #R #E #S #C $H#t! $Q #3 $#r ";

function readCompressed(target, data) {
  let u = 1;
  for (const [, duv, tv, hasR, rv] of data.matchAll(
    /([^ !]*)([^ !]{2})(!([^ ]*))? /g,
  )) {
    u += decompressNum(duv);
    let r = hasR ? decompressNum(rv) + 2 : 1;
    let t = decompressNum(tv);
    for (; r-- > 0; ++u, ++t) {
      target.set(u, t);
    }
  }
}

const decompressNum = (s) =>
  [...s].reduce((v, c) => v * 92 + c.charCodeAt(0) - 35, 0);

readCompressed(UNICODE_MAPPING, UNICODE_MAPPING_COMPRESSED);