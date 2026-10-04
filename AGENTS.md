<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the reference ring as a hosted GLB pointer and the Draco decoder in public assets; this preserves the source geometry while avoiding a large binary in source control.
- Keep the 3D scene client-only and coordinate its entrance and scroll camera movement with page controls; server rendering cannot create a WebGL context.
