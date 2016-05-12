Program main;
var
 i,j,t,m:integer;
 str: array [1 .. 20] of char;
 a:array [1 .. 15] of integer;
Begin
 a[i]:= t - m;
 i := i + j;
 while i <> j and i < 100 do
   begin
    if i * 2 > j + 3 then break;
    i := i + 1;
   end
 if i < j then
   begin
    i := j;
    j := j + 1;
   end
  else if i < 2 * j then
   i := 3 * j;
End.
