Program main;
var
 i,j,t,sck,n,t1,t2:integer;
 a: array [1 .. 20] of integer;
Begin
 n := 0;
 while n <> 20 do
   begin
    sck := scanf("%d", a + i);
    if sck = 0 then break;
    n := n + 1;
   end
 i := 0;
 while i <> n - 1 do
 begin
    j := i + 1;
    while j <> n do
    begin
        t1 := a[i];
        t2 := a[j];
        if t1 > t2 then
        begin
            t := a[i];
            a[i] := a[j];
            a[j] := t;
        end
    end
 end
 i := 0;
 while i < n do
    printf("%d", a[i]);
 exit;
End.
