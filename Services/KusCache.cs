using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Globalization;
using System.Linq;
using System.Text;
using VfkVisualization.Repositories;

namespace VfkVisualization.Services;

public class KusCache
{
    private const int Count = 10;
    private IReadOnlyCollection<Ku> allKus = [];

    public void Set(IReadOnlyCollection<Ku> kus)
    {
        this.allKus = kus;
    }

    public IEnumerable<Ku> Get(string? startsWith = null)
    {
        if (startsWith == null)
        {
            return allKus.Take(Count);
        }

        return allKus
            .Where(x => RemoveDiacritics(x.Name).StartsWith(RemoveDiacritics(startsWith), StringComparison.OrdinalIgnoreCase))
            .Take(Count);
    }
    
    private static string RemoveDiacritics(string text) 
    {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder(capacity: normalizedString.Length);

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder
            .ToString()
            .Normalize(NormalizationForm.FormC);
    }
}