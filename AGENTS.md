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

- CenFud uses a shared domain data layer and cart provider across public routes so restaurant, menu, cart, and checkout behavior remain consistent.
- User-owned CenFud data is persisted in Lovable Cloud behind row-level policies; public catalog data is read-only for anonymous visitors.
